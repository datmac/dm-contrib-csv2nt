'use strict';

var path = require('path')
, basename = path.basename(path.dirname(__filename))
, debug = require('debug')('mill:contrib:' + basename)
, Transform = require("stream").Transform
, CSV = require('csv-string')
, NT = require('./NT.js')
;

function Command(options)
{
  Transform.call(this, options);
  this.options = options || {}
  this.begin = true;
  this.separator = ',';
  this.buffer = '';
  this.titles = [];
  this.counter = 0;
}

Command.prototype = Object.create(
  Transform.prototype, { constructor: { value: Command }});

Command.prototype.parse = function (rows) {
  var self = this;

  rows.forEach(function (row) {
      if (self.counter === 0) {
        self.titles = row.slice(0);
        for (var i = 0; i < row.length; i++) {
          var x = NT.stringify('_:' + NT.echap(row[i]), 'title', row[i])
          if (x) {
            self.push(x);
          }
        }
      }
      else {
        if (row.length > self.titles.length) {
          // TODO
        }
        for (var i = 0; i < row.length; i++) {
          var x = NT.stringify('_:row' + self.counter, self.titles[i], row[i])
          if (x) {
            self.push(x);
          }
        }
      }
      self.counter++;
    }
  );
}

Command.prototype._transform = function (chunk, encoding, done) {
  var self = this;

  if (self.begin) {
    self.begin = false;
    self.separator = CSV.detect(chunk.toString());
    self.emit('begin');

  }
  self.buffer = self.buffer.concat(chunk.toString());
  var x = CSV.readChunk(self.buffer, self.separator, function (rows) {
      self.parse(rows);
    }
  );
  done();
  self.buffer = self.buffer.slice(x);
}
Command.prototype.end = function () {
  var self = this;
  CSV.readAll(self.buffer, self.separator, function (rows) {
      self.parse(rows);
    }
  );
  self.emit('end');
};

module.exports = function (options, si) {
  var cmd = new Command(options);
  return si.pipe(cmd);
}
