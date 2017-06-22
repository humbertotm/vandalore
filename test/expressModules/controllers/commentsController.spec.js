// Require controller
var commentsController = require('../../../src/expressAppModules/controllers/commentsController');

// Require models
var Comment            = require('../../../src/expressAppModules/models/commentModel'),
    User               = require('../../../src/expressAppModules/models/userModel'),
    Post               = require('../../../src/expressAppModules/models/postModel');

// Require testing tools
var chai               = require('chai'),
    chaiHttp           = require('chai-http'),
    expect             = chai.expect;
chai.use(chaiHttp);

var mockHttp           = require('node-mocks-http'),
    sinon              = require('sinon'),
    sinonStubPromise   = require('sinon-stub-promise');

require('sinon-mongoose');
sinonStubPromise(sinon);

// Require mongoose.
var mongoose     = require('mongoose'),
    Promise      = require('bluebird');
mongoose.Promise = Promise;

describe('Comments controller', function() {
    describe('verify_docs_create', function() {
        var reqWithUser, reqWithoutUser, res,
            id1, id2, id3, promiseAll, err, next,
            user, post, userMock, postMock;
        var sandbox = sinon.sandbox.create();

        beforeEach(function() {
            id1 = mongoose.Types.ObjectId();
            id2 = mongoose.Types.ObjectId();
            id3 = mongoose.Types.ObjectId();

            reqWithUser = mockHttp.createRequest({
                user: {
                    _id: id1.toString()
                },
                body: {
                    postId: id2.toString()
                }
            });

            reqWithoutUser = mockHttp.createRequest({
                body: {
                    postId: id2.toString()
                }
            });

            res = mockHttp.createResponse({});

            userMock = sandbox.mock(User);
            postMock = sandbox.mock(Post);

            user = new User();
            post = new Post();

            next = sandbox.spy();
            promiseAll = sandbox.stub(Promise, 'all');

        });

        afterEach(function() {
            reqWithUser = {};
            reqWithoutUser = {};
            res = {};
            post = {};
            user = {};
            sandbox.restore();
        });

        it('responds with 401 status when no user is authenticated', function() {
            commentsController.verify_docs_create(reqWithoutUser, res, next);

            var data = JSON.parse(res._getData());

            expect(res.statusCode).to.equal(401);
            expect(data.message).to.equal('Please authenticate.');
        });

        it('calls next() when everything goes right', function(done) {
            postMock
                .expects('findById')
                .chain('exec')
                .resolves();

            userMock
                .expects('findById')
                .chain('exec')
                .resolves();

            promiseAll.returnsPromise().resolves([post, user]);

            commentsController.verify_docs_create(reqWithUser, res, next).then(function() {
                postMock.verify();
                userMock.verify();
                expect(promiseAll.called).to.equal(true);
                expect(next.called).to.equal(true);
                done();
            });
        });

        it('responds with 404 status when user is null', function(done) {
            postMock
                .expects('findById')
                .chain('exec')
                .resolves();

            userMock
                .expects('findById')
                .chain('exec')
                .resolves();

            promiseAll.returnsPromise().resolves([post, null]);

            commentsController.verify_docs_create(reqWithUser, res, next).then(function() {
                var data = JSON.parse(res._getData());

                postMock.verify();
                userMock.verify();
                expect(promiseAll.called).to.equal(true);
                expect(next.called).to.equal(false);
                expect(res.statusCode).to.equal(404);
                expect(data.message).to.equal('User and/or Post not found.');
                done();
            });
        });

        it('responds with 404 status when post is null', function(done) {
            postMock
                .expects('findById')
                .chain('exec')
                .resolves();

            userMock
                .expects('findById')
                .chain('exec')
                .resolves();

            promiseAll.returnsPromise().resolves([null, user]);

            commentsController.verify_docs_create(reqWithUser, res, next).then(function() {
                var data = JSON.parse(res._getData());

                postMock.verify();
                userMock.verify();
                expect(promiseAll.called).to.equal(true);
                expect(next.called).to.equal(false);
                expect(res.statusCode).to.equal(404);
                expect(data.message).to.equal('User and/or Post not found.');
                done();
            });
        });

        it('calls next(err) when Promise.all() rejects', function() {
            err = {};
            promiseAll.returnsPromise().rejects(err);

            commentsController.verify_docs_create(reqWithUser, res, next).then(function(done) {
                expect(next.withArgs(err).called).to.equal(true);
                done();
            });
        });

        it('throws when bad parameters are passed', function() {
            var badReq = mockHttp.createRequest({
                user: {
                    _id: id1.toString()
                },
                body: {
                    postId: 'aaaa'
                }
            });

            expect(function() {
                commentsController.verify_docs_create(badReq, res, next);
            }).to.throw(Error);
        });
    });

    describe('create_comment', function() {
        var req, res, id1, id2, id3, err,
            comment, user, post, next, save, promiseAll, promiseJoin;
        var sandbox = sinon.sandbox.create();

        beforeEach(function() {
            id1 = mongoose.Types.ObjectId();
            id2 = mongoose.Types.ObjectId();
            id3 = mongoose.Types.ObjectId();

            next = sandbox.spy();
            save = sandbox.stub(Comment.prototype, 'save');
            promiseAll = sandbox.stub(Promise, 'all');
            promiseJoin = sandbox.stub(Promise, 'join');

            user    = new User();
            post    = new Post();
            comment = new Comment();

            req = mockHttp.createRequest({
                method: 'POST',
                url: '/comments',
                user: user,
                post: post
            });

            res = mockHttp.createResponse();
        });

        afterEach(function() {
            sandbox.restore();
            res = {};
            comment = {};
            err = {};
            req = {};
        });

        // Passing but throwing a MongooseError
        it('Makes all the appropriate calls when everyting goes right', function(done) {
            save.returnsPromise().resolves(comment);
            promiseAll.returnsPromise().resolves();

            commentsController.create_comment(req, res, next).then(function() {
                var data = JSON.parse(res._getData());

                expect(save.called).to.equal(true);
                expect(promiseAll.called).to.equal(true);
                expect(res.statusCode).to.equal(200);
                expect(data.entities.comments).to.exist;
                done();
            });
        });

        it('calls next err when Promise.join() rejects', function(done) {
            var err = {};
            promiseJoin.returnsPromise().rejects(err);

            commentsController.create_comment(req, res, next).then(function() {
                expect(promiseJoin.called).to.equal(true);
                expect(next.withArgs(err).called).to.equal(true);
                done();
            });
        });

        it('calls next(err) when comment.save() rejects', function(done) {
            err = {
                errors: {
                    message: 'Some error message.'
                }
            };

            save.returnsPromise().rejects(err);

            commentsController.create_comment(req, res, next).then(function() {
                expect(save.called).to.equal(true);
                expect(next.withArgs(err).called).to.equal(true);
                done();
            });
        });
    });

    describe('verify_docs_delete', function() {
        var reqWithUser, reqWithoutUser, res,
            id1, id2, id3, promiseAll, err, next,
            user, post, comment,
            userMock, postMock, commentMock;
        var sandbox = sinon.sandbox.create();

        beforeEach(function() {
            id1 = mongoose.Types.ObjectId();
            id2 = mongoose.Types.ObjectId();
            id3 = mongoose.Types.ObjectId();

            reqWithUser = mockHttp.createRequest({
                user: {
                    _id: id1.toString()
                },
                body: {
                    postId: id2.toString(),
                    commentId: id3.toString()
                }
            });

            reqWithoutUser = mockHttp.createRequest({
                body: {
                    postId: id2.toString()
                }
            });

            res = mockHttp.createResponse({});

            userMock    = sandbox.mock(User);
            postMock    = sandbox.mock(Post);
            commentMock = sandbox.mock(Comment);

            user    = new User();
            post    = new Post();
            comment = new Comment();

            next       = sandbox.spy();
            promiseAll = sandbox.stub(Promise, 'all');

        });

        afterEach(function() {
            reqWithUser = {};
            reqWithoutUser = {};
            res = {};
            post = {};
            user = {};
            comment = {};
            sandbox.restore();
        });

        it('responds with 401 status when no user is authenticated', function() {
            commentsController.verify_docs_delete(reqWithoutUser, res, next);

            var data = JSON.parse(res._getData());

            expect(res.statusCode).to.equal(401);
            expect(data.message).to.equal('Please authenticate.');
        });

        it('calls next() when everything goes right', function(done) {
            postMock
                .expects('findById')
                .chain('exec')
                .resolves();

            userMock
                .expects('findById')
                .chain('exec')
                .resolves();

            commentMock
                .expects('findById')
                .chain('exec')
                .resolves();

            promiseAll.returnsPromise().resolves([comment, user, post]);

            commentsController.verify_docs_delete(reqWithUser, res, next).then(function() {
                postMock.verify();
                userMock.verify();
                commentMock.verify();
                expect(promiseAll.called).to.equal(true);
                expect(next.called).to.equal(true);
                done();
            });
        });

        it('responds with 404 status when some doc is null', function(done) {
            postMock
                .expects('findById')
                .chain('exec')
                .resolves();

            userMock
                .expects('findById')
                .chain('exec')
                .resolves();

            commentMock
                .expects('findById')
                .chain('exec')
                .resolves();

            promiseAll.returnsPromise().resolves([comment, null, post]);

            commentsController.verify_docs_delete(reqWithUser, res, next).then(function() {
                var data = JSON.parse(res._getData());

                postMock.verify();
                userMock.verify();
                commentMock.verify();
                expect(promiseAll.called).to.equal(true);
                expect(next.called).to.equal(false);
                expect(res.statusCode).to.equal(404);
                expect(data.message).to.equal('User and/or Comment and/or Post not found.');
                done();
            });
        });

        it('calls next(err) when Promise.all() rejects', function() {
            err = {};
            promiseAll.returnsPromise().rejects(err);

            commentsController.verify_docs_delete(reqWithUser, res, next).then(function(done) {
                expect(next.withArgs(err).called).to.equal(true);
                done();
            });
        });

        it('throws when bad parameters are passed', function() {
            var badReq = mockHttp.createRequest({
                user: {
                    _id: id1.toString()
                },
                body: {
                    postId: 'aaaa',
                    commentId: id2.toString()
                }
            });

            expect(function() {
                commentsController.verify_docs_delete(badReq, res, next);
            }).to.throw(Error);
        });
    });

    describe('delete_comment', function() {
        var req, res, user, post,
            id1, id2, id3,
            comment, remove, next;
        var sandbox = sinon.sandbox.create();

        beforeEach(function() {
            id1 = mongoose.Types.ObjectId();
            id2 = mongoose.Types.ObjectId();
            id3 = mongoose.Types.ObjectId();

            user = new User();
            post = new Post();
            comment = new Comment();

            req = mockHttp.createRequest({
                user: user,
                post: post,
                comment: comment
            });

            res = mockHttp.createResponse();

            remove      = sandbox.stub(Comment.prototype, 'remove');
            next        = sandbox.spy();
        });

        afterEach(function() {
            req = {};
            res = {};
            sandbox.restore();
            comment = {};
            user = {};
            post = {};
        });

        it('responds with 403 if comment user does not match auth user', function() {
            comment.userId = id1;
            user._id = id2;

            commentsController.delete_comment(req, res);

            var data = JSON.parse(res._getData());

            expect(res.statusCode).to.equal(403);
            expect(data.message).to.equal('You are not authorized to perform this operation.');
        });

        it('successfully deletes comment and sends 200 res', function(done) {
            comment.userId = id1;
            user._id = id1;

            remove.returnsPromise().resolves();

            commentsController.delete_comment(req, res, next).then(function() {
                var data = JSON.parse(res._getData());

                expect(remove.called).to.equal(true);
                expect(res.statusCode).to.equal(200);
                expect(data.commentId).to.exist;
                expect(data.message).to.equal('Comment successfully deleted.');
                done();
            });
        });

        it('calls next(err) when comment.remove() rejects', function(done) {
            comment.userId = id1;
            user._id = id1;

            var err = {
                errors: {
                    message: 'Some error message.'
                }
            };

            remove.returnsPromise().rejects(err);

            commentsController.delete_comment(req, res, next).then(function() {
                expect(remove.called).to.equal(true);
                expect(next.withArgs(err).called).to.equal(true);
                done();
            });
        });
    });
});