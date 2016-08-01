# Vizabi DDFcsv reader

## Install

```
npm i
```

## Run tests

```
npm test
```

## Usage

```
const Vizabi = require('vizabi');
const ddfCsvReader = require('vizabi-ddfcsv-reader');
const readerObject = ddfCsvReader.getDDFCsvReaderObject(ddfExtra.chromeFs);
Vizabi.Reader.extend('ddf-csv-reader', readerObject);
// ...
```

## File readers

`Vizabi DDFcsv reader` has 3 file reader:
 
  * FrontendFileReader
  * BackendFileReader
  * ChromeFileReader
  
### BackendFileReader

This reader is designed for file reading via OS file system.
  
### FrontendFileReader

This reader is designed for file reading via HTTP protocol.

### ChromeFileReader

This reader is designed for file reading via Chrome File System API. More info: [here](https://developer.chrome.com/apps/fileSystem).

These readers should be used on different cases: `BackendFileReader` is good for console tools such as [Vizabi Metadata Generator](https://github.com/Gapminder/vizabi-metadata-generator),
`FrontendFileReader` is good for `DDFcsv reader` using in Gapminder Tools or Gapminder Offline,
`ChromeFileReader` is good only for `Chrome Application`.

## DDFcsv reader usage for DDF data reading example

```
import {BackendFileReader, Ddf} from 'vizabi-ddfcsv-reader';

const backendFileReader = new BackendFileReader();
const ddf = new Ddf('your-ddf-folder', backendFileReader);
// for example, :
const query = {
  select: ['geo', 'geo.name', 'geo.world_4region'],
  where: {'geo.is--country': true},
  grouping: {},
  orderBy: null
};

ddf.getIndex(indexErr => {
  ddf.getConcepts((conceptsErr, conceptsData) => {
    // process indexErr here ...

    // process conceptsData here ...

    ddf.getAllDataPointsContent(
      (dataPointsFileErr, dataPointsData) => {
        // process dataPointsFileErr here ...
        
        // process dataPointsData here ...
      },
      dataPointsAllErr => {
        // process dataPointsAllErr here ...

        // data reading finish
      });
  });
});
```
