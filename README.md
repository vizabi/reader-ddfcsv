# Vizabi DDFcsv reader

## Install

```
npm i
npm test
```

## Usage

```
var Vizabi = require('vizabi');
var ddfCsvReader = require('vizabi-ddfcsv-reader');
var readerObject = ddfCsvReader.getDDFCsvReaderObject(ddfExtra.chromeFs);
Vizabi.Reader.extend('ddf-csv-reader', readerObject);
// ...
```

## Attention

This module is not finished and  it's not stable!
