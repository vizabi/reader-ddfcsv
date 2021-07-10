# Vizabi DDFcsv reader

## Install

```
npm i @vizabi/reader-ddfcsv
```

## Usage

```
const Vizabi = require('vizabi');
const ddfCsvReader = require('reader-ddfcsv');
const readerObject = ddfCsvReader.getDDFCsvReaderObject();
Vizabi.Reader.extend('ddf-csv-reader', readerObject);
// ...
```

## Build

```
git clone https://github.com/vizabi/reader-ddfcsv.git
cd reader-ddfcsv
npm i
npm run build
```

### Run tests

```
npm test
```

And after this you can see `dist` folder that contains two sets:

  * `bundle.js` and `bundle.js.map`
  * `bundle.web.js` and `bundle.web.js.map`
  
First one is for using with electron app or tests. Second one is only for using in browser.

## File readers

`Vizabi DDFcsv reader` has 2 file readers:
 
  * FrontendFileReader is a part of `bundle.js` version.
  * BackendFileReader is a part of `bundle.web.js` version.
  
### BackendFileReader

This reader is designed for file reading via OS file system.
  
### FrontendFileReader

This reader is designed for file reading via HTTP protocol.

## DDFcsv reader usage for DDF data reading examples:

```
import {BackendFileReader, Ddf} from 'reader-ddfcsv';

const backendFileReader = new BackendFileReader();
const ddf = new Ddf('your-ddf-folder', backendFileReader);

ddf.getIndex(indexErr => {
  // process indexErr here ...
    
  ddf.getConcepts((conceptsErr, conceptsData) => {
    // process conceptsErr here ...

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

or 

```
import {BackendFileReader, Ddf} from 'reader-ddfcsv';

const backendFileReader = new BackendFileReader();
const ddf = new Ddf('your-ddf-folder', backendFileReader);
// for example, :
const query = {
  from: 'entities',
  animatable: 'time',
    select: {
      key: ['geo'],
      value: ['geo.name', '_default', 'geo.world_4region']
    },
    where: {'geo.is--country': true},
    grouping: {},
    orderBy: null
  };
  
ddf.processRequest(query, (err, data) => {
    // process err here ...

    // process expected data here ...
};
```
