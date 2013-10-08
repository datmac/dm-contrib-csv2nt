'use strict';
var  path = require('path')
, basename = path.basename(path.dirname(__filename))
, util = require('util')
, should = require('should')
, tester = require('dm-core').tester
, command = require('./index.js')
;


describe(basename, function () {

    describe('#1', function () {
        it('should be normalized', function (done) {
            tester(command, {})
            .send("t1,t2,t3\nv1,v2,v3\n")
            .end(function (err, res) {
                res.should.equal('_:t1 <title> "t1" .\n_:t2 <title> "t2" .\n_:t3 <title> "t3" .\n_:row1 <t1> "v1" .\n_:row1 <t2> "v2" .\n_:row1 <t3> "v3" .\n');
                done();
              }
            );
          }
        )
      }
    )
    describe('#2', function () {
        it('should be normalized', function (done) {
            tester(command, {})
            .send("école !?,%pourCENT,c` est un test\nv1,v2,v3\n")
            .end(function (err, res) {
                res.should.equal('_:ecole- <title> "école !?" .\n_:-pourcent <title> "%pourCENT" .\n_:c-est-un-test <title> "c` est un test" .\n_:row1 <ecole-> "v1" .\n_:row1 <-pourcent> "v2" .\n_:row1 <c-est-un-test> "v3" .\n');
                done();
              }
            );
          }
        )
      }
    )

  }
);

