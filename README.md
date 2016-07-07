# Vizabi DDFcsv reader

## Install

```
npm i
npm test
```

## Usage

```
var Vizabi = require('vizabi');
var DDFCSVReader = require('vizabi-ddfcsv-reader').DDFCSVReader;
var readerName = 'ddf1-csv2';
var ddfCsvReader = new DDFCSVReader(readerName).getReaderObject();
Vizabi.Reader.extend(readerName, ddfCsvReader);

require('vizabi/build/dist/vizabi.css');
```

## Attention

This module is not finished and  it's not stable!
