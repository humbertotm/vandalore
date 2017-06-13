// Require controller
var votesController  = require('../../../src/expressAppModules/controllers/votesController');

// Require models
var User             = require('../../../src/expressAppModules/models/userModel'),
    Post             = require('../../../src/expressAppModules/models/postModel'),
    Notification     = require('../../../src/expressAppModules/models/notificationModel');

var utils            = require('../../../src/expressAppModules/utils');

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
var mongoose         = require('mongoose'),
    Promise          = require('bluebird');
mongoose.Promise     = Promise;

describe('Votes controller', function() {
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
            votesController.verify_docs(reqWithoutUser, res, next);

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

            votesController.verify_docs(reqWithUser, res, next).then(function() {
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

            votesController.verify_docs(reqWithUser, res, next).then(function() {
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

            votesController.verify_docs(reqWithUser, res, next).then(function() {
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

            votesController.verify_docs(reqWithUser, res, next).then(function(done) {
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
                votesController.verify_docs(badReq, res, next);
            }).to.throw(Error);
        });
    });

    describe('create_vote', function() {
        var req, res, user,
            post, id1, id2, id3, err, next,
            userSave, postSave;
        var sandbox = sinon.sandbox.create();

        beforeEach(function() {
            id1 = mongoose.Types.ObjectId();
            id2 = mongoose.Types.ObjectId();
            id3 = mongoose.Types.ObjectId();

            user = new User({
                _id: id1,
                votedPosts: []
            });

            post = new Post({
                _id: id2,
                voteCount: 2
            });

            res = mockHttp.createResponse();

            req = mockHttp.createRequest({
                method: 'POST',
                url: '/votes',
                user: user,
                post: post
            });

            next       = sandbox.spy();
            userSave   = sandbox.stub(User.prototype, 'save');
            postSave   = sandbox.stub(Post.prototype, 'save');
        });

        afterEach(function() {
            sandbox.restore();
            req = {};
            res = {};
            err = {};
            user = {};
            post = {};
        });

        it('responds with 309 when a vote for the post already exists', function() {
            user.votedPosts = [id2, id3];

            votesController.create_vote(req, res, next);

            var data = JSON.parse(res._getData());
            expect(res.statusCode).to.equal(309);
            expect(data.message).to.equal('A vote for this post already exists.');
            expect(userSave.called).to.equal(false);
            expect(postSave.called).to.equal(false);
        });

        it('Makes the appropriate calls when everything goes right', function(done) {
            userSave.returnsPromise().resolves();
            postSave.returnsPromise().resolves();

            votesController.create_vote(req, res, next).then(function() {
                expect(userSave.called).to.equal(true);
                expect(postSave.called).to.equal(true);
                expect(next.called).to.equal(true);
                done();
            });
        });

        it('calls next(err) when user.save() rejects', function(done) {
            err = {
                errors: {
                    message: 'Some error message.'
                }
            };

            userSave.returnsPromise().rejects(err);
            postSave.returnsPromise().resolves();

            votesController.create_vote(req, res, next).then(function() {
                expect(userSave.called).to.equal(true);
                expect(postSave.called).to.equal(false);
                expect(next.withArgs(err).called).to.equal(true);
                done();
            });
        });

        it('calls next(err) when post.save() rejects', function(done) {
            err = {
                errors: {
                    message: 'Some error message.'
                }
            };

            userSave.returnsPromise().resolves();
            postSave.returnsPromise().rejects(err);

            votesController.create_vote(req, res, next).then(function() {
                expect(userSave.called).to.equal(true);
                expect(postSave.called).to.equal(true);
                expect(next.withArgs(err).called).to.equal(true);
                done();
            });
        });
    });

    describe.skip('vote_count', function() {
        var post, noti, next, id1, id2, id3,
            req, res, notiSave, mockVotes;
        var sandbox = sinon.sandbox.create();

        beforeEach(function() {
            id1 = mongoose.Types.ObjectId();
            id2 = mongoose.Types.ObjectId();
            id3 = mongoose.Types.ObjectId();


            next        = sandbox.spy();
            notiSave    = sandbox.stub(Notification.prototype, 'save');
            mockVotes   = sandbox.stub(utils, 'votesForHot');

            post = new Post();

            req = mockHttp.createRequest({
                post: post
            });
            res = mockHttp.createResponse();

            noti = new Notification();
        });

        afterEach(function() {
            sandbox.restore();
            noti = {};
            post = {};
            req = {};
            res = {};
        });

        it('responds with 200 when post is already hot', function() {
            post.voteCount = 5;
            post.hot = true;

            // Call the middleware function.
            votesController.vote_count(req, res, next);

            var data = JSON.parse(res._getData());

            expect(res.statusCode).to.equal(200);
            expect(notiSave.called).to.equal(false);
            expect(next.calledOnce).to.equal(false);
        });

        it.skip('creates new notification and saves it when post reaches vote count for hot', function(done) {
            post.voteCount = 3;
            post.hot = false;

            mockVotes.returnsPromise().resolves(2);
            notiSave.returnsPromise().resolves();

            votesController.vote_count(req, res, next).then(function() {
                expect(mockVotes.calledOnce).to.equal(true);
                //expect(notiSave.calledOnce).to.equal(true);
                done();
            });
        });

        it('does nothing when post has not reached vote count for hot', function(done) {
            post = new Post({
                _id: id2,
                voteCount: 1,
                hot: false
            });

            postMock
                .expects('findById')
                .chain('exec')
                .resolves(post);

            votesController.vote_count(req, res, next).then(function() {
                postMock.verify();
                expect(notiSave.called).to.equal(false);
                expect(next.called).to.equal(false);
                done();
            });
        });

        it('calls next(err) when doc.save() rejects', function(done) {
            var err = {
                errors: {
                    message: 'Some error message.'
                }
            }

            post = new Post({
                _id: id2,
                voteCount: 3,
                hot: false
            });

            postMock
                .expects('findById')
                .chain('exec')
                .resolves(post);

            notiSave.returnsPromise().rejects(err);

            votesController.vote_count(req, res, next).then(function() {
                postMock.verify();
                expect(notiSave.called).to.equal(true);
                expect(next.withArgs(err).called).to.equal(true);
                done();
            });
        });

        it('calls next(err) when Post.findById() rejects', function(done) {
            var err = {
                errors: {
                    message: 'Some error message.'
                }
            }

            postMock
                .expects('findById')
                .chain('exec')
                .rejects(err);

            // Call middleware function.
            votesController.vote_count(req, res, next).then(function() {
                postMock.verify();
                expect(next.withArgs(err).called).to.equal(true);
                done();
            });
        });
    });

    describe('delete_vote', function() {
        var req, res,
            id1, id2, id3, id4, id5,
            next, user, post, userSave, postSave;
        var sandbox = sinon.sandbox.create();

        beforeEach(function() {
            id1 = mongoose.Types.ObjectId();
            id2 = mongoose.Types.ObjectId();
            id3 = mongoose.Types.ObjectId();
            id4 = mongoose.Types.ObjectId();
            id5 = mongoose.Types.ObjectId();

            post = new Post();
            user = new User();

            req = mockHttp.createRequest({
                post: post,
                user: user
            });

            res = mockHttp.createResponse();

            next     = sandbox.spy();
            userSave = sandbox.stub(User.prototype, 'save');
            postSave = sandbox.stub(Post.prototype, 'save');
        });

        afterEach(function() {
            sandbox.restore();
            req = {};
            res = {};
            user = {};
            post = {};
        });

        it('responds with 200 when everything goes right', function(done) {
            post._id = id3;
            post.voteCount = 3;
            user.votedPosts = [id2, id3, id4];

            userSave.returnsPromise().resolves();
            postSave.returnsPromise().resolves();

            votesController.delete_vote(req, res, next).then(function() {
                var data = JSON.parse(res._getData());

                expect(userSave.called).to.equal(true);
                expect(postSave.called).to.equal(true);
                expect(res.statusCode).to.equal(200);
                expect(data.message).to.equal('Vote successfully deleted.');
                done();
            });
        });

        it('responds with 404 when post is not found among user votedPosts', function() {
            post._id = id3;
            user.votedPosts = [id2, id4];

            votesController.delete_vote(req, res, next);

            var data = JSON.parse(res._getData());
            expect(userSave.called).to.equal(false);
            expect(postSave.called).to.equal(false);
            expect(res.statusCode).to.equal(404);
            expect(data.message).to.equal('Vote not found.');
        });

        it('calls next(err) when user.save() rejects', function(done) {
            post._id = id3;
            post.voteCount = 3;
            user.votedPosts = [id2, id3, id4];

            var err = {};

            userSave.returnsPromise().rejects(err);

            votesController.delete_vote(req, res, next).then(function() {
                expect(userSave.called).to.equal(true);
                expect(postSave.called).to.equal(false);
                expect(next.withArgs(err).called).to.equal(true);
                done();
            });
        });

        it('calls next(err) when post.save() rejects', function(done) {
            post._id = id3;
            post.voteCount = 3;
            user.votedPosts = [id2, id3, id4];

            var err = {};

            userSave.returnsPromise().resolves();
            postSave.returnsPromise().rejects(err);

            votesController.delete_vote(req, res, next).then(function() {
                expect(userSave.called).to.equal(true);
                expect(postSave.called).to.equal(true);
                expect(next.withArgs(err).called).to.equal(true);
                done();
            });
        });
    });
});