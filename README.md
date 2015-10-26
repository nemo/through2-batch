[![Build Status](https://circleci.com/gh/nemo/through2-batch.svg?style=svg)](https://circleci.com/gh/nemo/through2-batch)

through2-batch
===================

A stream that transforms chunks to batches form the stream.
[![NPM](https://nodei.co/npm/through2-batch.png?downloads&downloadRank)](https://nodei.co/npm/through2-batch/)

A way to use a Node.JS Transform stream that batches chunks into an array (default is 10).
Objects/chunks will still come in the same order, just in batched arrays.

Built using [through2](https://github.com/rvagg/through2) and has the
same API with the addition of a `batchSize` option.

Non-`objectMode` streams are supported for completeness.

Written by Nima Gardideh ([halfmoon.ws](http://halfmoon.ws)) and used in production by [Taplytics](http://taplytics.com).



Install
-------

```bash
npm install --save through2-batch
```

Examples
--------

Process rows from a CSV in batches.

```javascript
var through2Batch = require('through2-batch');

fs.createReadStream('data.csv')
  .pipe(csv2())
  .pipe(through2Batch.obj(
    {batchSize: 100},
    function (batch, enc, callback) {
      var self = this;
      console.log(batch.length); // 100
      someThingAsync(batch, function (newChunk) {
        self.push(newChunk);
      });
  }));
```


Contributing
------------

Fixed or improved stuff? Great! Send me a pull request [through GitHub](http://github.com/nemo/through2-batch)
or get in touch on Twitter [@ngardideh](@ngardideh).
