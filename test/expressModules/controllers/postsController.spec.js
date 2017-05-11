// Require controller
var postsController = require('../../../src/expressAppModules/controllers/postsController');

// Require models
var Post = require('../../../src/expressAppModules/models/postModel');
var User = require('../../../src/expressAppModules/models/userModel');
var Category = require('../../../src/expressAppModules/models/categoryModel');
var Comment = require('../../../src/expressAppModules/models/commentModel');

// Require testing tools
var chai = require('chai');
var chaiHttp = require('chai-http');
var expect = chai.expect;
chai.use(chaiHttp);

var mockHttp = require('node-mocks-http');
var sinon = require('sinon');
require('sinon-mongoose');
var sinonStubPromise = require('sinon-stub-promise');
sinonStubPromise(sinon);

// Require mongoose.
var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');

describe('Posts controller', function() {
    describe('create_post', function() {
        var id1, id2, id3, save, next, post,
                reqWithUser, reqWithoutUser, res;
        var sandbox = sinon.sandbox.create();

        beforeEach(function() {
            id1 = mongoose.Types.ObjectId();
            id2 = mongoose.Types.ObjectId();
            id3 = mongoose.Types.ObjectId();

            post = new Post({
                _id: id2,
                userId: id1,
                title: 'Some title',
                description: 'Some description',
                image: 'some-image-url',
                category: 1
            });

            reqWithUser = mockHttp.createRequest({
                method: 'POST',
                url: '/posts',
                user: {
                    _id: id1
                },
                body: {
                    title: 'Some title',
                    description: 'Some description',
                    image: 'some-image-url',
                    category: 1
                }
            });

            reqWithoutUser = mockHttp.createRequest({
                method: 'POST',
                url: '/posts',
                body: {
                    title: 'Some title',
                    description: 'Some description',
                    image: 'some-image-url',
                    category: 1
                }
            });

            res = mockHttp.createResponse();

            save = sandbox.stub(Post.prototype, 'save');
            next = sandbox.spy();
        });

        afterEach(function() {
            sandbox.restore();
            reqWithUser = {};
            reqWithoutUser = {};
            res = {};
        });

        it('responds with 401 status if no user is authenticated', function() {
            postsController.create_post(reqWithoutUser, res, next);

            var data = JSON.parse(res._getData());

            expect(res.statusCode).to.equal(401);
            expect(data.message).to.equal('Please authenticate.');
        });

        it('creates and responds with new post', function(done) {
            save.returnsPromise().resolves(post);

            postsController.create_post(reqWithUser, res, next).then(function() {
                var data = JSON.parse(res._getData());

                expect(save.called).to.equal(true);
                expect(res.statusCode).to.equal(200);
                expect(data._id).to.exist;
                expect(next.withArgs(post).calledOnce).to.equal(true);
                done();
            });
        });

        it('responds with error when post.save() rejects', function(done) {
            var err = {
                errors: {
                    message: 'Some error message.'
                }
            };

            save.returnsPromise().rejects(err);

            postsController.create_post(reqWithUser, res, next).then(function() {
                var data = JSON.parse(res._getData());

                expect(save.called).to.equal(true);
                expect(next.called).to.equal(false);
                expect(res.statusCode).to.equal(500);
                expect(data.errors).to.exist;
                done();
            });
        });
    });

    describe('push_and_save_post middleware', function() {
        var id1, id2, id3, userMock, categoryMock,
                consoleLog, promiseAll, post, user, category,
                userSave, categorySave;

        var sandbox = sinon.sandbox.create();

        beforeEach(function() {
            id1 = mongoose.Types.ObjectId();
            id2 = mongoose.Types.ObjectId();
            id3 = mongoose.Types.ObjectId();

            post = new Post({
                _id: id2,
                userId: id1,
                title: 'Some title',
                description: 'Some description',
                image: 'some-image-url',
                category: 1
            });

            user = new User({
                _id: id1,
                posts: []
            });

            category = new Category({
                _id: 1,
                posts: []
            });

            userMock = sandbox.mock(User);
            categoryMock = sandbox.mock(Category);
            consoleLog = sandbox.spy(console, 'log');
            promiseAll = sandbox.stub(Promise, 'all');
            userSave = sandbox.stub(User.prototype, 'save');
            categorySave = sandbox.stub(Category.prototype, 'save');
        });

        afterEach(function() {
            sandbox.restore();
            post = {};
            user = {};
            category = {};
        });

        it('makes the appropriate calls when everything goes right', function(done) {
            userMock
                .expects('findById')
                .chain('exec')
                .resolves(user);

            categoryMock
                .expects('findById')
                .chain('exec')
                .resolves(category);

            userSave.returnsPromise().resolves();
            categorySave.returnsPromise().resolves();
            promiseAll.returnsPromise().resolves([user, category]);

            postsController.push_and_save_post(post).then(function() {
                expect(promiseAll.called).to.equal(true);
                userMock.verify();
                categoryMock.verify();
                expect(userSave.called).to.equal(true);
                expect(categorySave.called).to.equal(true);
                done();
            });
        });

        it('logs error to the console when Promise.all() rejects', function(done) {
            var err = {
                errors: {
                    message: 'Some error message.'
                }
            };

            promiseAll.returnsPromise().rejects(err);

            postsController.push_and_save_post(post).then(function() {
                expect(promiseAll.called).to.equal(true);
                expect(userSave.called).to.equal(false);
                expect(categorySave.called).to.equal(false);
                expect(consoleLog.withArgs(err).calledOnce).to.equal(true);
                done();
            });
        });
    });

    describe('delete_post', function() {
        var reqWithUser, reqWithoutUser, res,
                mockPost, remove, user, post,
                id1, id2, id3, id4;
        var sandbox = sinon.sandbox.create();

        beforeEach(function() {
            id1 = mongoose.Types.ObjectId();
            id2 = mongoose.Types.ObjectId();
            id3 = mongoose.Types.ObjectId();
            id4 = mongoose.Types.ObjectId();

            post = new Post({
                _id: id2,
                userId: id1,
                title: 'Some title',
                description: 'Some description',
                image: 'some-image-url',
                category: 1
            });

            reqWithUser = mockHttp.createRequest({
                method: 'DELETE',
                url: '/posts',
                user: {
                    _id: id1
                },
                body: {
                    post: {
                        _id: id2,
                        userId: id1,
                        title: 'Some title',
                        description: 'Some description',
                        image: 'some-image-url',
                        category: 1
                    }
                }
            });

            reqWithoutUser = mockHttp.createRequest({
                method: 'DELETE',
                url: '/posts',
                body: {
                    post: {
                        _id: id2,
                        title: 'Some title',
                        description: 'Some description',
                        image: 'some-image-url',
                        category: 1
                    }
                }
            });

            res = mockHttp.createResponse();

            mockPost = sandbox.mock(Post);
            remove = sandbox.stub(Post.prototype, 'remove');
        });

        afterEach(function() {
            sandbox.restore();
            reqWithUser = {};
            reqWithoutUser = {};
            res = {};
            post = {};
        });

        it('responds with 401 status if no user is authenticated', function() {
            postsController.delete_post(reqWithoutUser, res);

            var data = JSON.parse(res._getData());

            expect(remove.called).to.equal(false);
            expect(res.statusCode).to.equal(401);
            expect(data.message).to.equal('Please authenticate.');
        });

        it('makes the appropriate calls when everything goes right', function(done) {
            mockPost
                .expects('findById')
                .chain('exec')
                .resolves(post);

            remove.returnsPromise().resolves(post);

            postsController.delete_post(reqWithUser, res).then(function() {
                var data = JSON.parse(res._getData());

                mockPost.verify();
                expect(remove.called).to.equal(true);
                expect(res.statusCode).to.equal(200);
                expect(data.message).to.equal('Post successfully deleted.');
                expect(data.post).to.exist;
                done();
            });
        });

        it('responds with 403 status when auth user does not match post user', function(done) {
            var reqWithUser1 = mockHttp.createRequest({
                method: 'DELETE',
                url: '/posts',
                user: {
                    _id: id1
                },
                body: {
                    post: {
                        _id: id3,
                        title: 'Some title',
                        description: 'Some description',
                        image: 'some-image-url',
                        category: 1
                    }
                }
            });

            var post1 = new Post({
                _id: id3,
                userId: id4,
                title: 'Some title',
                description: 'Some description',
                image: 'some-image-url',
                category: 1
            });

            mockPost
                .expects('findById')
                .chain('exec')
                .resolves(post1);

            postsController.delete_post(reqWithUser1, res).then(function() {
                var data = JSON.parse(res._getData());

                mockPost.verify();
                expect(remove.called).to.equal(false);
                expect(res.statusCode).to.equal(403);
                expect(data.message).to.equal('You are not authorized to perform this operation.');
                done();
            });
        });

        it('responds with err when Post.findById() rejects', function(done) {
            var err = {
                errors: {
                    message: 'Some error message.'
                }
            };

            mockPost
                .expects('findById')
                .chain('exec')
                .rejects(err);

            postsController.delete_post(reqWithUser, res).then(function() {
                var data = JSON.parse(res._getData());

                mockPost.verify();
                expect(remove.called).to.equal(false);
                expect(res.statusCode).to.equal(500);
                expect(data.errors).to.exist;
                done();
            });
        });

        it('responds with err when post.remove() rejects', function(done) {
            var err = {
                errors: {
                    message: 'Some error message.'
                }
            };

            mockPost
                .expects('findById')
                .chain('exec')
                .resolves(post);

            remove.returnsPromise().rejects(err);

            postsController.delete_post(reqWithUser, res).then(function() {
                var data = JSON.parse(res._getData());

                mockPost.verify();
                expect(remove.called).to.equal(true);
                expect(res.statusCode).to.equal(500);
                expect(data.errors).to.exist;
                done();
            });
        });
    });

    describe('get_post', function() {
        var req, res, postMock, id1, id2, id3,
                comm1, comm2, post;
        var sandbox = sinon.sandbox.create();

        beforeEach(function() {
            id1 = mongoose.Types.ObjectId;
            id2 = mongoose.Types.ObjectId;
            id3 = mongoose.Types.ObjectId;

            req = mockHttp.createRequest({
                method: 'GET',
                url: '/posts/:postId',
                params: {
                    postId: id1
                }
            });

            comm1 = new Comment();
            comm2 = new Comment();

            post = new Post({
                _id: id1,
                comments: [comm1, comm2]
            });

            res = mockHttp.createResponse();

            postMock = sandbox.mock(Post);
        });

        afterEach(function() {
            sandbox.restore();
            req = {};
            res = {};
            comm1 = {};
            comm2 = {};
        });

        it('responds with post and comments', function(done) {
            postMock
                .expects('findById')
                .chain('populate')
                .chain('exec')
                .resolves(post);

            postsController.get_post(req, res).then(function() {
                var data = JSON.parse(res._getData());

                postMock.verify();
                expect(res.statusCode).to.equal(200);
                expect(data.comments.length).to.equal(2);
                done();
            });
        });

        it('responds with err when Post.findById() rejects', function(done) {
            var err = {
                errors: {
                    message: 'Some error message.'
                }
            };

            postMock
                .expects('findById')
                .chain('populate')
                .chain('exec')
                .rejects(err);

            postsController.get_post(req, res).then(function() {
                var data = JSON.parse(res._getData());

                postMock.verify();
                expect(res.statusCode).to.equal(500);
                expect(data.errors).to.exist;
                done();
            });
        });
    });

    describe('get_post_comments', function() {
        var req, res, id1, id2, id3, post, comm1, comm2, postMock;
        var sandbox = sinon.sandbox.create();

        beforeEach(function() {
            id1 = mongoose.Types.ObjectId();
            id2 = mongoose.Types.ObjectId();
            id3 = mongoose.Types.ObjectId();

            req = mockHttp.createRequest({
                method: 'GET',
                url: '/posts/:postId/comments',
                params: {
                    postId: id1
                }
            });

            res = mockHttp.createResponse();

            postMock = sandbox.mock(Post);

            comm1 = new Comment();
            comm2 = new Comment();
            post = new Post({
                _id: id1,
                comments: [comm1, comm2]
            });
        });

        afterEach(function() {
            sandbox.restore();
            req = {};
            res = {};
            comm1 = {};
            comm2 = {};
            post = {};
        });

        it('responds with comments from a post', function(done) {
            postMock
                .expects('findById')
                .chain('populate')
                .chain('exec')
                .resolves(post);

            postsController.get_post_comments(req, res).then(function() {
                var data = JSON.parse(res._getData());

                postMock.verify();
                expect(res.statusCode).to.equal(200);
                expect(data.length).to.equal(2);
                done();
            });
        });

        it('responds with err when Post.findById() rejects', function(done) {
            var err = {
                errors: {
                    message: 'Some error message.'
                }
            };

            postMock
                .expects('findById')
                .chain('populate')
                .chain('exec')
                .rejects(err);

            postsController.get_post_comments(req, res).then(function() {
                var data = JSON.parse(res._getData());

                postMock.verify();
                expect(res.statusCode).to.equal(500);
                expect(data.errors).to.exist;
                done();
            });
        });
    });
});