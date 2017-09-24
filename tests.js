var through2Batch = require('./through2-batch');
var through2 = require('through2');
var _ = require('lodash');
var streamify = require('stream-array');
var sinon = require('sinon');
var chai = require('chai');
var expect = chai.expect;
var should = chai.should();

describe("through2-batch", function() {
    var objs = [];
    var stream;

    before(function(done) {
        _.each(_.range(0, 1000), function(i) {
            objs.push(i);
        });
        done();
    });

    after(function(done) {
        objs = [];
        done();
    });

    beforeEach(function(done) {
        stream = streamify(objs);
        done();
    });

    afterEach(function(done) {
        stream = null;
        done();
    });

    it("should accept options", function(done) {
        var transform = sinon.stub().yields();

        stream.pipe(through2Batch({objectMode: true}, transform, function() {
            expect(transform.callCount).to.be.above(0);
            done();
        }));
    });

    it("should accept arguments without options", function(done) {
        var transform = sinon.stub().yields();

        stream.pipe(through2Batch.obj(transform, function() {
            expect(transform.callCount).to.be.above(0);
            done();
        }));
    });

    it("should accept arguments without flush", function(done) {
        var transform = sinon.stub().yields();

        stream.pipe(through2Batch({objectMode: true}, transform));

        stream.on('end', function() {
            expect(transform.callCount).to.be.above(0);
            done();
        });
    });

    it("should have a default batchSize", function(done) {
        var transform = sinon.stub().yields();

        stream.pipe(through2Batch({objectMode: true}, transform, function() {
            shouldHaveBatchedWithSize(10, transform);
            done();
        }));
    });

    it("should accept a batchSize option", function(done) {
        var transform = sinon.stub().yields();

        stream.pipe(through2Batch({objectMode: true, batchSize: 32}, transform, function() {
            shouldHaveBatchedWithSize(32, transform);
            done();
        }));
    });

    describe("obj", function() {
        it("should have a default batchSize", function(done) {
            var transform = sinon.stub().yields();

            stream.pipe(through2Batch.obj(transform, function() {
                shouldHaveBatchedWithSize(10, transform);
                done();
            }));
        });

        it("should accept a batchSize option", function(done) {
            var transform = sinon.stub().yields();

            stream.pipe(through2Batch.obj({batchSize: 32}, transform, function() {
                shouldHaveBatchedWithSize(32, transform);
                done();
            }));
        });

    });

    describe("through2 interface", function() {
        testTemplate = function(through2BatchTransform, done) {
            objectsProcessed = 0

            stream.pipe(through2Batch.obj(through2BatchTransform))
                .pipe(through2.obj(lastTransformSpy = sinon.spy(function(batch, enc, next){
                        objectsProcessed += batch.length
                        next()
                })))
                .on('finish', function() {
                    expect(lastTransformSpy.callCount).to.be.above(0);
                    expect(objectsProcessed).to.be.equal(1000);
                    done();
                });
        };

        it("passes values to next stream using this.push()", function(done) {
            transform = function(batch, enc, next){
                this.push(batch);
                next();
            };
            testTemplate(transform, done);
        });

        it("passes values to next stream using .next(null, values)", function(done) {
            transform = function(batch, enc, next){
                next(null, batch);
            };
            testTemplate(transform, done);

        });

    });
    describe("optional tranform fn", function() {
        it("doesn't need tranform fn and can just pipe batch to next stream", function(done) {
            var objectsProcessed = 0
            stream.pipe(through2Batch.obj())
                .pipe(through2.obj(function(batch, enc, next){
                    objectsProcessed += batch.length
                    next();
                }))
                .on('finish', function(){
                  expect(objectsProcessed).to.be.equal(1000);
                  done()
                });
        });
    });

    function shouldHaveBatchedWithSize(batchSize, transform) {
        var totalProcessed = 0;
        var totalBatches = Math.ceil(objs.length / batchSize);
        expect(transform.callCount).to.be.equal(totalBatches);

        _.each(_.range(0, totalBatches), function(batchIndex) {
            var batch = transform.getCall(batchIndex).args[0];
            expect(batch.length).to.be.most(batchSize);
            _.each(batch, function(item) {
                var index = objs.indexOf(item);
                expect(index).to.not.equal(-1);
            });

            totalProcessed += batch.length;
        });

        expect(totalProcessed).to.equal(objs.length);
    }
});


