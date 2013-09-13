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

Command.prototype._transform = function (chunk, encoding, done) {
  var self = this;

  self.buffer += chunk;

  if (self.begin) {
    self.begin = false;
    self.separator = CSV.detect(self.buffer);
    self.emit('begin');
  }

  var r, s = 0;

  while (r = CSV.read(self.buffer.slice(s), this.separator, function (row) {
        if (self.counter === 0) {
          self.titles = row.slice(0);
          for (var i = 0; i < row.length; i++) {
            var x = NT.stringify('_:' + NT.echap(row[i]), 'title', row[i])
            debug('out', x)
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
              debug('out', x)
              self.push(x);
            }
          }
        }
        self.counter++;
      }
    )
  ) {
    s += r;
  }
  self.buffer = self.buffer.slice(s);
}
Command.prototype.end = function () {
  var that = this;
  that.emit('end');
};

module.exports = function (options, si) {
  var cmd = new Command(options);
  return si.pipe(cmd);
}
