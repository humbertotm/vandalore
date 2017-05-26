var chai             = require('chai'),
    expect           = chai.expect;

var Comment          = require('../../../src/expressAppModules/models/commentModel'),
    User             = require('../../../src/expressAppModules/models/userModel'),
    Post             = require('../../../src/expressAppModules/models/postModel');

var commentMid       = require('../../../src/expressAppModules/models/docMiddleware/commentMid');

var Promise          = require('bluebird'),
    mongoose         = require('mongoose');
mongoose.Promise     = Promise;

var sinon            = require('sinon'),
    sinonStubPromise = require('sinon-stub-promise');

require('sinon-mongoose');
sinonStubPromise(sinon);



describe('Comment model', function() {
    var id;

    beforeEach(function() {
        id = require('mongoose').Types.ObjectId();
    });

    it('should be invalid if no userId is present', function(done) {
        var c = new Comment({});

        c.validate(function(err) {
            expect(err.errors.userId).to.exist;
            done();
        });
    });

    it('should be invalid if no postId is present', function(done) {
        var c = new Comment({ userId: id });

        c.validate(function(err) {
            expect(err.errors.postId).to.exist;
            done();
        });
    });

    it('should be invalid if no content is present', function(done) {
        var c = new Comment({
            userId: id,
            postId: id
        });

        c.validate(function(err) {
            expect(err.errors.content).to.exist;
            done();
        });
    });

    it('should be valid invalid if content exceeds 140 characters', function(done) {
        var contentA = Array(142).join('a');
        var c = new Comment({
            userId: id,
            postId: id,
            content: contentA
        });

        c.validate(function(err) {
            expect(err.errors.content).to.exist;
            done();
        });
    });

    it('should be valid', function(done) {
        var contentA = Array(110).join('a');
        var c = new Comment({
            userId: id,
            postId: id,
            content: contentA
        });

        c.validate(function(err) {
            expect(err).to.equal(null);
            done();
        });
    });
});

describe('Comment middleware', function() {
    describe('postSave middleware', function() {
        var doc, next, id1, id2, id3, postMock, userMock, promiseMap;
        var sandbox = sinon.sandbox.create();

        beforeEach(function() {
            next       = sandbox.spy();
            userMock   = sandbox.mock(User);
            postMock   = sandbox.mock(Post);
            promiseMap = sandbox.stub(Promise, 'map');

            doc = new Comment({
                _id: id1,
                userId: id2,
                postId: id3,
                content: 'Some comment.'
            });
        });

        afterEach(function() {
            sandbox.restore();
            doc = {};
        });

        it('makes the appropriate calls when everything goes right', function(done) {
            userMock
                .expects('findById')
                .chain('exec')
                .resolves();

            postMock
                .expects('findById')
                .chain('exec')
                .resolves();

            promiseMap.returnsPromise().resolves();

            commentMid.postSave(doc, next).then(function() {
                userMock.verify();
                postMock.verify();
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

            commentMid.postSave(doc, next).then(function() {
                expect(next.withArgs(err).called).to.equal(true);
                done();
            });
        });
    });

    describe('postRemove middleware', function() {
        var doc, next, id1, id2, id3, postMock, userMock, promiseMap;
        var sandbox = sinon.sandbox.create();

        beforeEach(function() {
            next       = sandbox.spy();
            userMock   = sandbox.mock(User);
            postMock   = sandbox.mock(Post);
            promiseMap = sandbox.stub(Promise, 'map');

            doc = new Comment({
                _id: id1,
                userId: id2,
                postId: id3,
                content: 'Some comment.'
            });
        });

        afterEach(function() {
            sandbox.restore();
            doc = {};
        });

        it('makes the appropriate calls when everything goes right', function(done) {
            userMock
                .expects('findById')
                .chain('exec')
                .resolves();

            postMock
                .expects('findById')
                .chain('exec')
                .resolves();

            promiseMap.returnsPromise().resolves();

            commentMid.postRemove(doc, next).then(function() {
                userMock.verify();
                postMock.verify();
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

            commentMid.postRemove(doc, next).then(function() {
                expect(next.withArgs(err).called).to.equal(true);
                done();
            });
        });
    });
});