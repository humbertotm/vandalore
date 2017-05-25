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
var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');

describe('Comments controller', function() {
    describe('create_comment', function() {
        var res, id1, id2, id3, err,
            comment, next, save;
        var sandbox = sinon.sandbox.create();
        var reqWithUser, reqWithoutUser;

        beforeEach(function() {
            res = mockHttp.createResponse();
            id1 = mongoose.Types.ObjectId();
            id2 = mongoose.Types.ObjectId();
            id3 = mongoose.Types.ObjectId();

            next = sandbox.spy();
            save = sandbox.stub(Comment.prototype, 'save');

            reqWithUser = mockHttp.createRequest({
                method: 'POST',
                url: '/comments',
                user: {
                    _id: id1.toString()
                },
                body: {
                    postId: id2.toString(),
                    content: 'Some comment.'
                }
            });

            reqWithoutUser = mockHttp.createRequest({
                method: 'POST',
                url: '/comments',
                body: {
                    postId: id1.toString(),
                    userId: id2.toString()
                }
            });
        });

        afterEach(function() {
            sandbox.restore();
            res = {};
            comment = {};
            err = {};
            reqWithUser = {};
            reqWithoutUser = {};
        });

        it('Should send response with 401 status if no user is authenticated', function() {
            commentsController.create_comment(reqWithoutUser, res);

            var data = JSON.parse(res._getData());
            expect(res.statusCode).to.equal(401);
            expect(data.message).to.equal('Please authenticate.');
        });

        it('Makes all the appropriate calls when everyting goes right', function(done) {
            comment = new Comment({
                _id: id3,
                userId: id1,
                postId: id2,
                content: 'Some comment.'
            });

            save.returnsPromise().resolves(comment);

            commentsController.create_comment(reqWithUser, res, next).then(function() {
                var data = JSON.parse(res._getData());

                expect(res.statusCode).to.equal(200);
                expect(data.content).to.exist;
                expect(save.called).to.equal(true);
                expect(next.calledOnce).to.equal(true);
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

            commentsController.create_comment(reqWithUser, res, next).then(function() {
                expect(save.called).to.equal(true);
                expect(next.withArgs(err).called).to.equal(true);
                done();
            });
        });

        it.skip('throws when bad parameters are passed', function() {
            var badReq = mockHttp.createRequest({
                user: {
                    _id: 'aaaaaaaaaaaaaaa'
                },
                body: {
                    postId: 'aaaaaaabbbaaaaa'
                }
            });

            expect(commentsController.create_comment(badReq, res, next)).to.throw(Error);
        });
    });

/*
    describe('push_and_save_comment middleware', function() {
        var id1, id2, id3, comment, user, post, req, res, next;
        var sandbox = sinon.sandbox.create();

        beforeEach(function() {
            id1 = mongoose.Types.ObjectId();
            id2 = mongoose.Types.ObjectId();
            id3 = mongoose.Types.ObjectId();

            comment = new Comment({
                _id: id1,
                userId: id2,
                postId: id3,
                content: 'Some message.'
            });

            req = mockHttp.createRequest({
                comment: comment
            });

            res  = mockHttp.createResponse();
            next = sandbox.spy();
        });

        afterEach(function() {
            sandbox.restore();
            comment = {};
            user = {};
            post = {};
        });

        it('makes the appropriate calls when everyting goes right', function(done) {
            user = new User({
                _id: id2,
                comments: []
            });

            post = new Post({
                _id: id3,
                comments: []
            });

            var saveUser = sandbox.stub(User.prototype, 'save');
            var savePost = sandbox.stub(Post.prototype, 'save');
            var promiseAll = sandbox.stub(Promise, 'all');

            var userMock = sandbox.mock(User);
            var postMock = sandbox.mock(Post);

            userMock
                .expects('findById')
                .chain('exec')
                .resolves(user);

            postMock
                .expects('findById')
                .chain('exec')
                .resolves(post);

            saveUser.returnsPromise().resolves();
            savePost.returnsPromise().resolves();
            promiseAll.returnsPromise().resolves([user, post]);

            commentsController.push_and_save_comment(req, res, next).then(function() {
                expect(promiseAll.called).to.equal(true);
                userMock.verify();
                postMock.verify();
                expect(saveUser.called).to.equal(true);
                expect(savePost.called).to.equal(true);
                done();
            });
        });

        it('calls next(err) when Promise.all() rejects', function(done) {
            var promiseAll = sandbox.stub(Promise, 'all');
            var saveUser = sandbox.stub(User.prototype, 'save');
            var savePost = sandbox.stub(Post.prototype, 'save');

            var err = {
                errors: {
                    message: 'Some error message.'
                }
            };

            promiseAll.returnsPromise().rejects(err);

            commentsController.push_and_save_comment(req, res, next).then(function() {
                expect(promiseAll.called).to.equal(true);
                expect(saveUser.called).to.equal(false);
                expect(savePost.called).to.equal(false);
                expect(next.withArgs(err).calledOnce).to.equal(true);
                done();
            });
        });

        it.skip('calls next(err) when doc.save() rejects', function(done) {
            var promiseAll = sandbox.stub(Promise, 'all');
            var saveUser = sandbox.stub(User.prototype, 'save');
            var savePost = sandbox.stub(Post.prototype, 'save');

            var userMock = sandbox.mock(User);
            var postMock = sandbox.mock(Post);

            user = new User({
                _id: id2,
                comments: []
            });

            post = new Post({
                _id: id3,
                comments: []
            });

            userMock
                .expects('findById')
                .chain('exec')
                .resolves(user);

            postMock
                .expects('findById')
                .chain('exec')
                .resolves(post);

            var err = {
                errors: {
                    message: 'Some error message.'
                }
            };

            promiseAll.returnsPromise().resolves([user, post]);
            saveUser.returnsPromise().resolves();
            savePost.returnsPromise().rejects(err);

            commentsController.push_and_save_comment(req, res, next).then(function() {
                userMock.verify();
                postMock.verify();
                expect(promiseAll.called).to.equal(true);
                expect(savePost.called).to.equal(true);
                // Not calling next. Figure out why.
                expect(next.withArgs(err).called).to.equal(true);
                done();
            });

        });
    });
*/

    describe('delete_comment', function() {
        var reqWithUser, reqWithoutUser, res,
            id1, id2, id3, id4, id5,
            comment, commentMock, remove, next;
        var sandbox = sinon.sandbox.create();

        beforeEach(function() {
            res = mockHttp.createResponse();
            id1 = mongoose.Types.ObjectId();
            id2 = mongoose.Types.ObjectId();
            id3 = mongoose.Types.ObjectId();
            id4 = mongoose.Types.ObjectId();
            id5 = mongoose.Types.ObjectId();

            reqWithUser = mockHttp.createRequest({
                method: 'DELETE',
                url: '/comments',
                user: {
                    _id: id1.toString()
                },
                body: {
                    _id: id3.toString(),
                    postId: id2.toString(),
                    userId: id1.toString(),
                    content: 'Some comment.'
                }
            });

            reqWithoutUser = mockHttp.createRequest({
                method: 'DELETE',
                url: '/comments',
                body: {
                    _id: id3.toString(),
                    postId: id2.toString(),
                    userId: id1.toString(),
                    content: 'Some comment.'
                }
            });

            res = mockHttp.createResponse();

            comment = new Comment({
                _id: id2,
                userId: id1,
                postId: id3,
                content: 'Some message.'
            });

            commentMock = sandbox.mock(Comment);
            remove      = sandbox.stub(Comment.prototype, 'remove');
            next        = sandbox.spy();
        });

        afterEach(function() {
            reqWithoutUser = {};
            reqWithUser = {};
            res = {};
            sandbox.restore();
            comment = {};
        });

        it('returns 401 if no user is authenticated', function() {
            commentsController.delete_comment(reqWithoutUser, res);

            var data = JSON.parse(res._getData());

            expect(res.statusCode).to.equal(401);
            expect(data.message).to.equal('Please authenticate.');
        });

        it('successfully deletes comment and sends 200 res', function(done) {
            commentMock
                .expects('findById')
                .chain('exec')
                .resolves(comment);

            remove.returnsPromise().resolves();

            commentsController.delete_comment(reqWithUser, res, next).then(function() {
                var data = JSON.parse(res._getData());

                commentMock.verify();
                expect(remove.called).to.equal(true);
                expect(res.statusCode).to.equal(200);
                expect(data.commentId).to.exist;
                expect(data.message).to.exist;
                expect(data.message).to.equal('Comment successfully deleted.');
                done();
            });
        });

        it('responds with 403 status when req.user._id does not match comment owner', function(done) {
            var comment1 = new Comment({
                _id: id4,
                postId: id3,
                userId: id5,
                content: 'Some message.'
            });

            commentMock
                .expects('findById')
                .chain('exec')
                .resolves(comment1);

            commentsController.delete_comment(reqWithUser, res, next).then(function() {
                var data = JSON.parse(res._getData());

                commentMock.verify();
                expect(remove.called).to.equal(false);
                expect(res.statusCode).to.equal(403);
                expect(data.message).to.equal('You are not authorized to perform this operation.');
                done();
            });
        })

        it('calls next(err) when Comment.findById() rejects', function(done) {
            var err = {
                errors: {
                    message: 'Some error message.'
                }
            };

            commentMock
                .expects('findById')
                .chain('exec')
                .rejects(err);

            commentsController.delete_comment(reqWithUser, res, next).then(function() {
                commentMock.verify();
                expect(next.withArgs(err).called).to.equal(true);
                done();
            });
        });

        it('calles next(err) when comment.remove() rejects', function(done) {
            var err = {
                errors: {
                    message: 'Some error message.'
                }
            };

            commentMock
                .expects('findById')
                .chain('exec')
                .resolves(comment);

            remove.returnsPromise().rejects(err);

            commentsController.delete_comment(reqWithUser, res, next).then(function() {
                commentMock.verify();
                expect(remove.called).to.equal(true);
                expect(next.withArgs(err).called).to.equal(true);
                done();
            });
        });

        it.skip('throws when bad parameters are passed', function() {
            var badReq = mockHttp.createRequest({
                user: {
                    _id: 'aaaaaaaaaaaaaaaaaaaaaaaa'
                },
                body: {
                    _id: 'bbbbbbbbbbbbbbbbbbbb'
                }
            });

            expect(commentsController.delete_comment(badReq, res, next)).to.throw(Error);
        });
    });
});