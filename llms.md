# reader-ddfcsv — LLM Context File

## Purpose

`@vizabi/reader-ddfcsv` is a **query engine / middleware** for DDF (Data Description Format) datasets stored as CSV files. It plays the role of a database driver: given a path to a dataset (local filesystem or remote URL), it reads `datapackage.json`, parses the schema, caches parsed CSV data, and answers **DDFQL queries** — returning tidy arrays of records suitable for data visualisation.

Used in:
- **small-waffle** (Node.js backend) — to serve dataset queries to Vizabi chart tools
- **Vizabi frontend charts** — direct browser use against GitHub-hosted datasets

---

## Tech Stack

- **TypeScript** source in `src/`
- **Two compile targets**:
  - `lib/` — Node.js (CommonJS-ish, uses `fs`), built by `tsc --project tsconfig.json`
  - `lib-web/` — browser (no `fs`), built by `tsc --project tsconfig-web.json`
- **`dist/reader-ddfcsv.js`** — UMD bundle for browsers, produced by Rollup + esbuild (minified)
- Runtime deps: `papaparse` (CSV), `lodash-es`, `d3-time-format`, `strip-bom`, `@vizabi/ddf-query-validator`
- Tests: Mocha + Chai + Sinon, run via `npm test` (aliases `npm run e2e`)

### Key commands
```bash
npm run build           # full build: lib-web → rollup bundle → lib (node)
npm run build:node      # tsc → lib/
npm run build:web       # tsc → lib-web/ + rollup → dist/
npm test                # tsc:node + e2e tests (mocha)
```

---

## Entry Points

| Context | File | Export |
|---------|------|--------|
| Node.js (`main`) | `lib/src/index.js` | `getDDFCsvReaderObject` (pre-wired with `BackendFileReader`) |
| Browser (`browser`) | `dist/reader-ddfcsv.js` | global `DDFCsvReader` UMD |
| Browser source | `lib-web/src/index-web.js` | `getDDFCsvReaderObject` (pre-wired with `FrontendFileReader`) |
| TypeScript types | `lib/src/index.d.ts` | — |

---

## Core Concepts

### Reader Object

Created via `getDDFCsvReaderObject()` (or `prepareDDFCsvReaderObject(fileReader)()`).

```js
import DDFCsvReader from "@vizabi/reader-ddfcsv";
const reader = new DDFCsvReader.getDDFCsvReaderObject();
reader.init({ path: "/local/path/to/dataset" });
const rows = await reader.read({ from: "datapoints", select: { key: ["geo","time"], value: ["pop"] }, where: {} });
```

`reader.init(options)`:
- `path` — dataset root (local path or URL; GitHub URLs auto-normalised via `githubPathAdapter`)
- `resultTransformer` — optional function applied to every result array (used in small-waffle)
- `_lastModified` — cache hint

`reader.read(queryParam)` — main query method; returns `Promise<object[]>`.

### DDFQL Query Structure
```js
{
  from: "concepts" | "entities" | "datapoints" | "*.schema",
  select: { key: ["geo", "time"], value: ["pop", "gdp"] },
  where: { geo: { $in: ["swe","nor"] }, time: { $gte: 2000 } },
  join: { "$geo": { key: "geo", where: { world_4region: "europe" } } },
  order_by: ["time", { geo: "asc" }],
  language: "en",
  repositoryPath: "/override/path"   // overrides init path per-query
}
```

Operators supported in `where`: `$and`, `$or`, `$not`, `$nor`, `$eq`, `$ne`, `$gt`, `$gte`, `$lt`, `$lte`, `$in`, `$nin`.

### Query Execution Pipeline (`ddf-csv.ts`)

```
reader.read(query)
  └─ query(queryParam, baseOptions)
       1. validateQueryStructure         (via ddf-query-validator)
       2. loadDataPackage                → parse datapackage.json, build resourcesLookup + keyValueLookup
       3. loadConcepts                   → query "concepts" CSV, build conceptsLookup, reparse typed fields
       4. validateQueryDefinitions       (via ddf-query-validator)
       5. getAppropriatePlugin?          → InClauseUnderConjunction optimizer (datapoints with $in joins)
       6. queryData(queryParam, options)
            ├─ loadResources             → fetch + parse CSV files (cached in resource.data Promise)
            ├─ getEntitySetFilter        → "$in all members of entity set" filter
            ├─ getJoinFilters            → resolve $join placeholders from entity/time tables
            ├─ joinData (reduce tables)  → merge multi-file results by primary key
            ├─ applyFilterRow            → filter by where + entitySetFilter + joinFilters
            ├─ fillMissingValues         → null for missing columns
            ├─ projectRow                → drop non-selected columns
            ├─ orderData                 → sort by order_by
            └─ parseTime                 → convert time strings to Date objects (d3-time-format)
```

### Caches (per reader instance)
| Cache | Contents |
|-------|----------|
| `datapackage` | Parsed `datapackage.json` |
| `resourcesLookup` | `Map<resourceName, resource>` — resource objects with `.data` Promise once loaded |
| `keyValueLookup` | `Map<keyString, Map<valueConcept, resource[]>>` — fast file selection by query key+value |
| `resource.data` | Cached `Promise<{data, resource}>` from `loadFile` — CSV loaded once per session |

Caches are **instance-level** — create a new reader instance to force a reload.

### File Readers (`IResourceRead` interface)

Both implement `readText(filePath, callback, options?)` and `checkFile(path)`:

- **`BackendFileReader`** — uses `fs.readFile` (Node.js only)
- **`FrontendFileReader`** — uses `fetch` (browser only)
- Custom reader: inject via `prepareDDFCsvReaderObject(myReader)()`

"Frankenstein" pattern — use `FrontendFileReader` in Node to fetch remote datasets:
```js
import { FrontendFileReader } from "@vizabi/reader-ddfcsv/lib-web/src/index-web.js";
const reader = new DDFCsvReader.prepareDDFCsvReaderObject(new FrontendFileReader)();
reader.init({ path: "https://github.com/open-numbers/ddf--gapminder--fasttrack.git" });
```

### `githubPathAdapter` (`src/file-readers/github-path-adapter.ts`)

Normalises any GitHub URL to `https://raw.githubusercontent.com/<org>/<repo>/refs/heads/<branch>`:
- `https://github.com/org/repo` → appends `/tree/master`
- `.git` suffix stripped
- `/tree/<branch>` → `/refs/heads/<branch>`
- `/blob/<branch>/file` → `/refs/heads/<branch>/file`
- Trailing slash and `/datapackage.json` suffix removed

### Resource Selection Optimizer (`src/resource-selection-optimizer/`)

When a datapoints query has a `join` clause filtering entity concepts with `$in`, `InClauseUnderConjunction` plugin kicks in to pre-select only the relevant CSV files (subset of all datapoint files) before loading data. Activated only when `datasetWithConstraints` is `true` (datapackage has `field.constraints.enum`).

### Time Parsing

Time concept columns are parsed to `Date` objects after query execution using `d3-time-format` parsers:

| concept name | format |
|---|---|
| `year` | `%Y` |
| `month` | `%Y-%m` |
| `day` | `%Y%m%d` |
| `week` | `%Yw%V` |
| `quarter` | `%Yq%q` |
| `time` | tries all above in order |

---

## Additional API

```js
reader.getDatasetInfo()           // returns datapackage minus ddfSchema and resources
reader.getAsset(path)             // reads file from <basePath>/assets/<path>; auto-parses JSON
reader.checkIfAssetExists(path)   // 200/404 check
reader.getFile(path, isJson)      // raw file read
```

---

## Project Structure

```
src/
  index.ts                     # Node entry: exports getDDFCsvReaderObject (BackendFileReader)
  index-web.ts                 # Browser entry: exports getDDFCsvReaderObject (FrontendFileReader)
  ddfcsv-reader.ts             # prepareDDFCsvReaderObject() factory — creates reader objects
  ddf-csv.ts                   # Core engine: ddfCsvReader() — all query/filter/join logic
  ddfcsv-error.ts              # DdfCsvError class + error type constants
  interfaces.ts                # TypeScript interfaces: IResourceRead, IBaseReaderOptions, IDatapackage, ...
  file-readers/
    backend-file-reader.ts     # fs-based file reader
    frontend-file-reader.ts    # fetch-based file reader
    github-path-adapter.ts     # URL normalisation for GitHub paths
  resource-selection-optimizer/
    index.ts                   # getAppropriatePlugin() — picks optimizer
    in-clause-under-conjunction.ts  # Optimizes $in+join datapoint queries

lib/        # Compiled Node output (tsc → tsconfig.json)
lib-web/    # Compiled browser output (tsc → tsconfig-web.json)
dist/
  reader-ddfcsv.js             # UMD bundle (Rollup + esbuild, minified)

test/
  main.spec.ts                 # General query tests (concepts, entities, datapoints)
  assets.spec.ts               # getAsset / checkIfAssetExists
  diagnostics.spec.ts          # Diagnostic/logging system
  features-service.spec.ts     # Feature detection via ddf-query-validator
  high-load.spec.ts            # Stress / concurrency tests
  multi-instances.spec.ts      # Multiple reader instance isolation
  schema.spec.ts               # *.schema queries
  static-fixtures/             # Test dataset (ddf--systema_globalis CSV files)
```

---

## Relation to Other Projects

| Project | How it uses reader-ddfcsv |
|---------|--------------------------|
| **small-waffle** | `npm i @vizabi/reader-ddfcsv`; one `readerInstance` per dataset×branch; passed a `resultTransformer`; queries come from Vizabi chart tools via HTTP |
| **Vizabi chart tools** | Frontend usage — init with GitHub URL; browser UMD bundle |
| **validate-ddf** | Separate tool — does not use this reader; validates DDF structure independently |

---

## Error Types

```
FILE_READING_ERROR   — fs/fetch failure
JSON_PARSING_ERROR   — datapackage.json parse failure  
CSV_PARSING_ERROR    — CSV parse failure (PapaParse error)
DDF_ERROR            — logical DDF/query error
```

All thrown as `DdfCsvError(message, details, filePath?)`.

---

## Publishing

1. `npm run build` (both targets + bundle)
2. Bump version in `package.json`
3. `npm publish`

The `prepublish` hook runs `build` automatically.
