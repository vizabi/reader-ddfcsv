# Vizabi DDFcsv reader
This package implements [DDF model](https://open-numbers.github.io/ddf.html) for datasets made of csv files and a datapackage.json. 
Once initialised, this reader can receive DDFQL queries, perform data searching, filtering, joinery etc and output an tidy data array for data visualisation.

See live example here https://observablehq.com/@vizabi/ddfcsv-reader
## Install
```bash
npm i @vizabi/reader-ddfcsv
```
## Usage
There are two implementations: for frontend and backend. Additionally, you can customise file reading plugin, so that for example backend implementation would fetch files online instead of reading locally.

* Backend implementation is at `lib/src/index.js`, also usable via es6 import `import DDFCsvReader from "@vizabi/reader-ddfcsv"`, as aliased by "main" field in package.json

* Frontend implementation is at `lib-web/src/index-web.js`, also bundled and minified to `dist/reader-ddfcsv.js`
### On Backend
```js
//this will import "lib/src/index.js", aliased by "main" in package.json
import DDFCsvReader from "@vizabi/reader-ddfcsv"; 

//init
const readerInstance = new DDFCsvReader.getDDFCsvReaderObject();
readerInstance.init({path: "path/to/local/dataset/root"});

//test reading some concepts
const concepts = await readerInstance.read({
	from: "concepts",
	language: "en",
	select: {key: ["concept"], value: ["concept_type", "name"]},
	where: {}
})
```
### On Frontend
On a plain webpage use
```js
import "@vizabi/reader-ddfcsv/dist/reader-ddfcsv.js";

//init
const ddfReader = new DDFCsvReader.getDDFCsvReaderObject();
reader.init({
	path: "https://github.com/open-numbers/ddf--gapminder--fasttrack.git"
})

const data = await readerInstance.read({
	from: "datapoints",
	language: "en",
	select: {key: ["country", "time"], value: ["gdp_pcap", "lex", "pop"]},
	where: {}
})

```
  
In Observable notebooks use
```
DDFCsvReader = require('https://unpkg.com/@vizabi/reader-ddfcsv@4.5.2')
```

which will redirect to https://unpkg.com/@vizabi/reader-ddfcsv@4.5.1/dist/reader-ddfcsv.js

See the [Live demo](https://observablehq.com/@vizabi/ddfcsv-reader)
## Custom file readers
Each implementation has its own default file readers built-in:
* FrontendFileReader is a part of `lib-web/src/index-web.js` version, also usable from `dist/reader-ddfcsv.js`
* BackendFileReader is a part of `lib/src/index.js` version.

You can find in the source code and import them readers separately
```js
import { FrontendFileReader } from "@vizabi/reader-ddfcsv/lib-web/src/index-web.js";
```
### FrontendFileReader
This reader is designed for file reading via HTTP protocol. It uses `fetch`, which since v4.5.2 is no longer polyfilled
### BackendFileReader
This reader is designed for file reading via OS file system. It uses `fs` and `path`
### Frankensteining: Using FrontendFileReader in a Backend instance
The backend version of `DDFCsvReader` defaults to `fs` for local files.
To fetch data from GitHub (or any remote source), inject the `FrontendFileReader`:

```js

import DDFCsvReader from "@vizabi/reader-ddfcsv";
import { FrontendFileReader } from "@vizabi/reader-ddfcsv/lib-web/src/index-web.js";

//init
const readerInstance = new DDFCsvReader.prepareDDFCsvReaderObject(new FrontendFileReader)();
readerInstance.init({ path: "https://github.com/open-numbers/ddf--gapminder--ai_worldview_benchmark.git" });

//usage example
const concepts = await readerInstance.read({
	from: "concepts",
	language: "en",
	select: {key: ["concept"], value: ["concept_type", "name"]},
	where: {}
})

```

## Data reading examples:
Once you can access concepts of a dataset you can run any other DDFQL query, see [DDFQL specs](https://open-numbers.github.io/ddf.html)

```js
//typical datapoint query
data = readerInstance.read({
	from: "datapoints",
	language: "en",
	select: {key: ["country", "time"], value: ["gdp_pcap", "lex", "pop"]},
	where: {}
})
```

interactive example: https://observablehq.com/@vizabi/ddfcsv-reader

## Build
```bash
git clone https://github.com/vizabi/reader-ddfcsv.git
cd reader-ddfcsv
npm i
npm run build
```
## Run tests
```bash
npm test
```