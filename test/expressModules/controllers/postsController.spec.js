// Require controller
var postsController  = require('../../../src/expressAppModules/controllers/postsController');

// Require models
var Post             = require('../../../src/expressAppModules/models/postModel'),
    User             = require('../../../src/expressAppModules/models/userModel'),
    Comment          = require('../../../src/expressAppModules/models/commentModel');

// Require testing tools
var chai             = require('chai'),
    chaiHttp         = require('chai-http'),
    expect           = chai.expect;
chai.use(chaiHttp);

var mockHttp         = require('node-mocks-http'),
    sinon            = require('sinon'),
    sinonStubPromise = require('sinon-stub-promise');

require('sinon-mongoose');
sinonStubPromise(sinon);

// Require mongoose.
var mongoose     = require('mongoose'),
    Promise      = require('bluebird');
mongoose.Promise = Promise;

describe('Posts controller', function() {
    describe('create_post', function() {
        var id1, id2, id3, save, next, post,
            reqWithUser, reqWithoutUser, res,
            user, userMock;
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

            user = new User();

            reqWithUser = mockHttp.createRequest({
                method: 'POST',
                url: '/posts',
                user: {
                    _id: id1.toString()
                },
                body: {
                    title: 'Some title',
                    description: 'Some description',
                    category: '1'
                },
                file: {
                    location: 'some-url'
                }
            });

            reqWithoutUser = mockHttp.createRequest({
                method: 'POST',
                url: '/posts',
                body: {
                    title: 'Some title',
                    description: 'Some description',
                    imageUrl: 'some-image-url',
                    category: '1'
                },
                file: {
                    location: 'some-url'
                }
            });

            res      = mockHttp.createResponse();
            save     = sandbox.stub(Post.prototype, 'save');
            next     = sandbox.spy();
            userMock = sandbox.mock(User);
        });

        afterEach(function() {
            sandbox.restore();
            reqWithUser = {};
            reqWithoutUser = {};
            res = {};
            post = {};
            user = {};
        });

        it('responds with 401 status if no user is authenticated', function() {
            postsController.create_post(reqWithoutUser, res, next);

            var data = JSON.parse(res._getData());

            expect(res.statusCode).to.equal(401);
            expect(data.message).to.equal('Please authenticate.');
        });

        it('creates and responds with new post', function(done) {
            userMock
                .expects('findById')
                .chain('exec')
                .resolves(user);

            save.returnsPromise().resolves(post);

            postsController.create_post(reqWithUser, res, next).then(function() {
                var data = JSON.parse(res._getData());

                userMock.verify();
                expect(save.called).to.equal(true);
                expect(res.statusCode).to.equal(200);
                expect(data.entities.posts).to.exist;
                done();
            });
        });

        it('calls next(err) when User.findById() rejects', function(done) {
            var err = {
                errors: {
                    message: 'Some error message.'
                }
            };

            userMock
                .expects('findById')
                .chain('exec')
                .rejects(err);

            postsController.create_post(reqWithUser, res, next).then(function() {
                userMock.verify();
                expect(save.called).to.equal(false);
                expect(next.withArgs(err).called).to.equal(true);
                done();
            });
        });

        it('calls next(err) when post.save() rejects', function(done) {
            userMock
                .expects('findById')
                .chain('exec')
                .resolves(user);

            var err = {
                errors: {
                    message: 'Some error message.'
                }
            };

            save.returnsPromise().rejects(err);

            postsController.create_post(reqWithUser, res, next).then(function() {
                userMock.verify();
                expect(save.called).to.equal(true);
                expect(next.withArgs(err).called).to.equal(true);
                done();
            });
        });

        it('throws when bad parameters are passed', function() {
            var badReq = mockHttp.createRequest({
                user: {
                    _id: 'aaaa'
                }
            });

            expect(function() {
                postsController.create_post(badReq, res, next);
            }).to.throw(Error);
        });
    });

    describe('verify_docs', function() {
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
            postsController.verify_docs(reqWithoutUser, res, next);

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

            postsController.verify_docs(reqWithUser, res, next).then(function() {
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

            postsController.verify_docs(reqWithUser, res, next).then(function() {
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

            postsController.verify_docs(reqWithUser, res, next).then(function() {
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

            postsController.verify_docs(reqWithUser, res, next).then(function(done) {
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
                postsController.verify_docs(badReq, res, next);
            }).to.throw(Error);
        });
    });

    describe('delete_post', function() {
        var req, res,
            save, remove, user, post,
            id1, id2, id3, id4, next;
        var sandbox = sinon.sandbox.create();

        beforeEach(function() {
            id1 = mongoose.Types.ObjectId();
            id2 = mongoose.Types.ObjectId();
            id3 = mongoose.Types.ObjectId();
            id4 = mongoose.Types.ObjectId();

            post = new Post();
            user = new User();

            req = mockHttp.createRequest({
                user: user,
                post: post
            });

            res      = mockHttp.createResponse();
            remove   = sandbox.stub(Post.prototype, 'remove');
            save     = sandbox.stub(User.prototype, 'save');
            next     = sandbox.spy();
        });

        afterEach(function() {
            sandbox.restore();
            req = {};
            res = {};
            post = {};
            user = {};
        });

        it('responds with 403 status if post user is not the same as auth user', function() {
            user.posts = [id2, id3];
            post._id = id4;

            postsController.delete_post(req, res, next);

            var data = JSON.parse(res._getData());

            expect(save.called).to.equal(false);
            expect(remove.called).to.equal(false);
            expect(res.statusCode).to.equal(403);
            expect(data.message).to.equal('You are not authorized to perform this operation.');
        });

        it('makes the appropriate calls when everything goes right', function(done) {
            user.posts = [id2, id3];
            post._id = id3;

            save.returnsPromise().resolves();
            remove.returnsPromise().resolves();

            postsController.delete_post(req, res, next).then(function() {
                var data = JSON.parse(res._getData());

                expect(save.called).to.equal(true);
                expect(remove.called).to.equal(true);
                expect(res.statusCode).to.equal(200);
                expect(data.message).to.equal('Post successfully deleted.');
                expect(data.postId).to.exist;
                done();
            });
        });

        it('calls next(err) when user.save() rejects', function(done) {
            user.posts = [id2, id3];
            post._id = id3;

            var err = {
                errors: {
                    message: 'Some error message.'
                }
            };

            save.returnsPromise().rejects(err);

            postsController.delete_post(req, res, next).then(function() {
                expect(save.called).to.equal(true);
                expect(remove.called).to.equal(false);
                expect(next.withArgs(err).called).to.equal(true);
                done();
            });
        });

        it('calls next(err) when post.remove() rejects', function(done) {
            user.posts = [id2, id3];
            post._id = id3;

            var err = {
                errors: {
                    message: 'Some error message.'
                }
            };

            save.returnsPromise().resolves();
            remove.returnsPromise().rejects(err);

            postsController.delete_post(req, res, next).then(function() {
                expect(save.called).to.equal(true);
                expect(remove.called).to.equal(true);
                expect(next.withArgs(err).called).to.equal(true);
                done();
            });
        });
    });

    describe('get_post', function() {
        var req, res, postMock, id1, id2, id3,
            post, next;
        var sandbox = sinon.sandbox.create();

        beforeEach(function() {
            id1 = mongoose.Types.ObjectId();
            id2 = mongoose.Types.ObjectId();
            id3 = mongoose.Types.ObjectId();

            req = mockHttp.createRequest({
                params: {
                    postId: id1.toString()
                }
            });

            post = new Post({
                _id: id1
            });

            res      = mockHttp.createResponse();
            postMock = sandbox.mock(Post);
            next     = sandbox.spy();
        });

        afterEach(function() {
            sandbox.restore();
            req = {};
            res = {};
            post = {};
        });

        it('responds with post', function(done) {
            postMock
                .expects('findById')
                .chain('exec')
                .resolves(post);

            postsController.get_post(req, res, next).then(function() {
                var data = JSON.parse(res._getData());

                postMock.verify();
                expect(res.statusCode).to.equal(200);
                expect(data.entities.posts).to.exist;
                done();
            });
        });

        it('responds with 404 when no post is found', function(done) {
            postMock
                .expects('findById')
                .chain('exec')
                .resolves(null);

            postsController.get_post(req, res, next).then(function() {
                var data = JSON.parse(res._getData());

                postMock.verify();
                expect(res.statusCode).to.equal(404);
                expect(data.message).to.equal('Post not found.');
                done();
            });
        });

        it('calls next(err) when Post.findById() rejects', function(done) {
            var err = {
                errors: {
                    message: 'Some error message.'
                }
            };

            postMock
                .expects('findById')
                .chain('exec')
                .rejects(err);

            postsController.get_post(req, res, next).then(function() {
                postMock.verify();
                expect(next.withArgs(err).called).to.equal(true);
                done();
            });
        });

        it('throws when bad parameters are passed', function() {
            var badReq = mockHttp.createRequest({
                params: {
                    postId: 'aaaa'
                }
            });

            expect(function() {
                postsController.get_post(badReq, res, next);
            }).to.throw(Error);
        });
    });

    describe('get_post_comments', function() {
        var req, res, postMock, next,
            id1, id2, id3, id4, id5,
            post, c1, c2, u1, u2;
        var sandbox = sinon.sandbox.create();

        beforeEach(function() {
            id1 = mongoose.Types.ObjectId();
            id2 = mongoose.Types.ObjectId();
            id3 = mongoose.Types.ObjectId();
            id4 = mongoose.Types.ObjectId();
            id5 = mongoose.Types.ObjectId();

            post = new Post();
            c1 = new Comment();
            c2 = new Comment();
            u1 = new User();
            u2 = new User();

            req = mockHttp.createRequest({
                method: 'GET',
                params: {
                    postId: id1.toString()
                }
            });
            res = mockHttp.createResponse();

            postMock = sandbox.mock(Post);
            next     = sandbox.spy();
        });

        afterEach(function() {
            req = {};
            res = {};
            post = {};
            c1 = {};
            c2 = {};
            u1 = {};
            u2 = {};
            sandbox.restore();
        });

        it('responds with comments', function(done) {
            u1._id = id1;
            u2._id = id2;
            c1.userId = u1;
            c2.userId = u2;
            post.comments = [c1, c2];

            postMock
                .expects('findById')
                .chain('populate')
                .chain('exec')
                .resolves(post);


            postsController.get_post_comments(req, res, next).then(function() {
                var data = JSON.parse(res._getData());

                postMock.verify();
                expect(res.statusCode).to.equal(200);
                expect(data.entities.comments.length).to.equal(2);
                done();
            });
        });

        it('leaves out orphaned comments', function(done) {
            u2._id = id2;
            c1.userId = null;
            c2.userId = u2;
            post.comments = [c1, c2];

            postMock
                .expects('findById')
                .chain('populate')
                .chain('exec')
                .resolves(post);


            postsController.get_post_comments(req, res, next).then(function() {
                var data = JSON.parse(res._getData());

                postMock.verify();
                expect(res.statusCode).to.equal(200);
                expect(data.entities.comments.length).to.equal(1);
                done();
            });
        });

        it('calls next(err) when Post.findById() rejects', function(done) {
            var err = {};

            postMock
                .expects('findById')
                .chain('populate')
                .chain('exec')
                .rejects(err);

            postsController.get_post_comments(req, res, next).then(function() {
                postMock.verify();
                expect(next.withArgs(err).called).to.equal(true);
                done();
            });
        });

        it('throws when bad params are passed', function() {
            var badReq = mockHttp.createRequest({
                method: 'GET',
                params: {
                    postId: 'aaaa'
                }
            });

            expect(function() {
                postsController.get_post_comments(badReq, res, next);
            }).to.throw(Error);
        });
    });
});