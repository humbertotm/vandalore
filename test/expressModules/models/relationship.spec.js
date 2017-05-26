var chai = require('chai');
var Relationship = require('../../../src/expressAppModules/models/relationshipModel');
var User = require('../../../src/expressAppModules/models/userModel');
var expect = chai.expect;
var relMid = require('../../../src/expressAppModules/models/docMiddleware/relationshipMid');

var Promise          = require('bluebird'),
    mongoose         = require('mongoose');
mongoose.Promise     = Promise;

var sinon            = require('sinon'),
    sinonStubPromise = require('sinon-stub-promise');

require('sinon-mongoose');
sinonStubPromise(sinon);

describe('Relationship model', function() {
    var id;

    beforeEach(function() {
        id = require('mongoose').Types.ObjectId();
    });

    it('should be valid', function(done) {
        var r = new Relationship({
            followedId: id,
            followerId: id
        });

        r.validate(function(err) {
            expect(err).to.equal(null);
            done();
        });
    });

    it('should be invalid if followerId is missing', function(done) {
        var r = new Relationship({
            followedId: id
        });

        r.validate(function(err) {
            expect(err.errors.followerId).to.exist;
            done();
        });
    });

    it('should be invalid if followedId is missing', function(done) {
        var r = new Relationship({
            followerId: id
        });

        r.validate(function(err) {
            expect(err.errors.followedId).to.exist;
            done();
        });
    });

    it('should not be valid if another relationship with the same followerId and followedId combo exists', function() {
        // Need mock db entries.
    });
});

describe('Relationship middleware', function() {
    describe('postSave middleware', function() {
        var doc, next, id1, id2, id3, userMock, promiseMap;
        var sandbox = sinon.sandbox.create();

        beforeEach(function() {
            next       = sandbox.spy();
            userMock   = sandbox.mock(User);
            promiseMap = sandbox.stub(Promise, 'map');

            doc = new Relationship({
                _id: id1,
                followerId: id2,
                followedId: id3
            });
        });

        afterEach(function() {
            sandbox.restore();
            doc = {};
        });

        it('makes the appropriate calls when everything goes right', function(done) {
            /*
            // Need to verify both calls.
            userMock
                .expects('findById')
                .chain('exec')
                .resolves();
            */

            promiseMap.returnsPromise().resolves();

            relMid.postSave(doc, next).then(function() {
                // userMock.verify();
                expect(promiseMap.called).to.equal(true);
                expect(next.called).to.equal(true);
                done();
            });
        });

        it('calls next(err) when Promise.map() rejects', function() {
            var err = {
                errors: {
                    message: 'Some error message.'
                }
            };
            promiseMap.returnsPromise().rejects(err);

            relMid.postSave(doc, next).then(function() {
                expect(next.withArgs(err).called).to.equal(true);
                done();
            });
        });
    });

    describe('postRemove middleware', function() {
        var doc, next, id1, id2, id3, userMock, promiseMap;
        var sandbox = sinon.sandbox.create();

        beforeEach(function() {
            next       = sandbox.spy();
            userMock   = sandbox.mock(User);
            promiseMap = sandbox.stub(Promise, 'map');

            doc = new Relationship({
                _id: id1,
                followerId: id2,
                followedId: id3
            });
        });

        afterEach(function() {
            sandbox.restore();
            doc = {};
        });

        it('makes the appropriate calls when everything goes right', function(done) {
            /*
            userMock
                .expects('findById')
                .chain('exec')
                .resolves();
            */

            promiseMap.returnsPromise().resolves();

            relMid.postRemove(doc, next).then(function() {
                // userMock.verify();
                expect(promiseMap.called).to.equal(true);
                expect(next.called).to.equal(true);
                done();
            });
        });

        it('calls next(err) when Promise.map() rejects', function() {
            var err = {
                errors: {
                    message: 'Some error message.'
                }
            };
            promiseMap.returnsPromise().rejects(err);

            relMid.postRemove(doc, next).then(function() {
                expect(next.withArgs(err).called).to.equal(true);
                done();
            });
        });
    });
});

