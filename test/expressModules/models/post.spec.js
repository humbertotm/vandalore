var chai = require('chai');
var Post = require('../../../src/expressAppModules/models/postModel');
var expect = chai.expect;

var Category          = require('../../../src/expressAppModules/models/categoryModel'),
    User             = require('../../../src/expressAppModules/models/userModel');

var postMid       = require('../../../src/expressAppModules/models/docMiddleware/postMid');

var Promise          = require('bluebird'),
    mongoose         = require('mongoose');
mongoose.Promise     = Promise;

var sinon            = require('sinon'),
    sinonStubPromise = require('sinon-stub-promise');

require('sinon-mongoose');
sinonStubPromise(sinon);

describe('Post model', function() {
    var id;
    var p;

    beforeEach(function() {
        p = new Post();
        id = require('mongoose').Types.ObjectId();
    });

    afterEach(function() {
        p = {};
    });

    it('should be invalid if no user is present', function(done) {
        p.validate(function(err) {
            expect(err.errors.user).to.exist;
            done();
        });
    });

    it('should be invalid if no title is present', function(done) {
        p.userId = id;

        p.validate(function(err) {
            expect(err.errors.title).to.exist;
            done();
        });
    });

    it('it should be invalid if title exceeds maxlength', function(done) {
        var titleA = Array(142).join('a');
        p.userId = id;
        p.title = titleA;

        p.validate(function(err) {
            expect(err.errors.title).to.exist;
            done();
        });
    });

    it('should be invalid if description exceeds maxlength', function(done) {
        var descriptionA = Array(1026).join('a');
        p.userId = id;
        p.title = 'Some string.';
        p.description = descriptionA;

        p.validate(function(err) {
            expect(err.errors.description).to.exist;
            done();
        });
    });

    it('should be invalid if image is not present', function(done) {
        p.userId = id;
        p.title = 'Some string.';
        p.description = 'Some description.';

        p.validate(function(err) {
            expect(err.errors.imageUrl).to.exist;
            done();
        });
    });

    it('should be invalid if no category is provided', function(done) {
        p.userId = id;
        p.title = 'Some string.';
        p.description = 'Some description.';
        p.image = '09fa8e6734a7ce';

        p.validate(function(err) {
            expect(err.errors.category).to.exist;
            done();
        });
    });

    it('should be valid', function(done) {
        p.user = id;
        p.title = 'Some title.';
        p.description = 'Some description.';
        p.imageUrl = 'some-url';
        p.category = 1;

        p.validate(function(err) {
            expect(err).to.equal(null);
            done();
        });
    });

    it('should be valid, too', function(done) {
        p.user = id;
        p.title = 'Some title.';
        p.imageUrl = 'some-url';
        p.category = 1;

        p.validate(function(err) {
            expect(err).to.equal(null);
            done();
        });
    });
});

describe('Post middleware', function() {
    describe('postSave middleware', function() {
        var doc, next, id1, id2, id3, catMock, userMock, promiseMap;
        var sandbox = sinon.sandbox.create();

        beforeEach(function() {
            next       = sandbox.spy();
            userMock   = sandbox.mock(User);
            catMock   = sandbox.mock(Category);
            promiseMap = sandbox.stub(Promise, 'map');

            doc = new Post({
                _id: id1,
                userId: id2,
                category: 2,
                title: 'Some title.',
                description: 'Some shit.',
                imageUrl: 'some-url'
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

            postMock
                .expects('findById')
                .chain('exec')
                .resolves();
            */

            promiseMap.returnsPromise().resolves();

            postMid.postSave(doc, next).then(function() {
                // userMock.verify();
                // catMock.verify();
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

            postMid.postSave(doc, next).then(function() {
                expect(next.withArgs(err).called).to.equal(true);
                done();
            });
        });
    });

    describe('postRemove middleware', function() {
        var doc, next, id1, id2, id3, catMock, userMock, promiseMap;
        var sandbox = sinon.sandbox.create();

        beforeEach(function() {
            next       = sandbox.spy();
            userMock   = sandbox.mock(User);
            catMock   = sandbox.mock(Category);
            promiseMap = sandbox.stub(Promise, 'map');

            doc = new Post({
                _id: id1,
                userId: id2,
                category: 2,
                title: 'Some title.',
                description: 'Some shit.',
                imageUrl: 'some-url'
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

            postMock
                .expects('findById')
                .chain('exec')
                .resolves();
            */

            promiseMap.returnsPromise().resolves();

            postMid.postRemove(doc, next).then(function() {
                // userMock.verify();
                // postMock.verify();
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

            postMid.postRemove(doc, next).then(function() {
                expect(next.withArgs(err).called).to.equal(true);
                done();
            });
        });
    });
});