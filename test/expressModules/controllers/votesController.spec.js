// Require controller
var votesController  = require('../../../src/expressAppModules/controllers/votesController');

// Require models
var User             = require('../../../src/expressAppModules/models/userModel'),
    Post             = require('../../../src/expressAppModules/models/postModel'),
    Notification     = require('../../../src/expressAppModules/models/notificationModel');

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
var mongoose         = require('mongoose');
Promise              = require('bluebird');

describe.only('Votes controller', function() {
    describe('create_vote', function() {
        var reqWithUser, reqWithoutUser, res, user,
            post, id1, id2, id3, err, next, promiseMap,
            userSave, postSave, userMock, postMock;
        var sandbox = sinon.sandbox.create();

        beforeEach(function() {
            id1 = mongoose.Types.ObjectId();
            id2 = mongoose.Types.ObjectId();
            id3 = mongoose.Types.ObjectId();
            res = mockHttp.createResponse();

            reqWithUser = mockHttp.createRequest({
                method: 'POST',
                url: '/votes',
                user: {
                    _id: id1.toString()
                },
                body: {
                    postId: id2.toString()
                }
            });

            reqWithoutUser = mockHttp.createRequest({
                method: 'POST',
                url: '/votes',
                body: {
                    postId: id2.toString()
                }
            });

            next       = sandbox.spy();
            // userSave   = sandbox.stub(User.prototype, 'save');
            // postSave   = sandbox.stub(Post.prototype, 'save');
            userMock   = sandbox.mock(User);
            postMock   = sandbox.mock(Post);
            promiseMap = sandbox.stub(Promise, 'map');

            user = new User({
                _id: id1,
                votedPosts: []
            });

            post = new Post({
                _id: id2,
                voteCount: 2
            });
        });

        afterEach(function() {
            sandbox.restore();
            reqWithUser = {};
            reqWithoutUser = {};
            res = {};
            err = {};
            user = {};
            post = {};
        });

        it('Sends response with 401 status and message if no user is authenticated', function() {
            votesController.create_vote(reqWithoutUser, res, next);

            var data = JSON.parse(res._getData());
            expect(res.statusCode).to.equal(401);
            expect(data.message).to.equal('Please authenticate.');
        });

        it('Returns a newly created vote', function(done) {
            // Since Promise.map() is being stubbed, I have not found a way
            // to look under the hood to check how the mapper function is working.
            userMock
                .expects('findById')
                .chain('exec')
                .resolves(user);

            postMock
                .expects('findById')
                .chain('exec')
                .resolves(post);

            // userSave.returnsPromise().resolves();
            // postSave.returnsPromise().resolves();
            promiseMap.returnsPromise().resolves();

            votesController.create_vote(reqWithUser, res, next).then(function() {
                var data = JSON.parse(res._getData());

                userMock.verify();
                postMock.verify();
                // expect(userSave.called).to.equal(true);
                // expect(postSave.called).to.equal(true);
                expect(res.statusCode).to.equal(200);
                expect(data.message).to.exist;
                expect(next.calledOnce).to.equal(true);
                done();
            });
        });

        it('calls next(err) when Promise.map() rejects', function(done) {
            // This encompasses a Model.findById() and/or a doc.save() rejecting.
            // Have not found a way to test specifically for any of these cases.
            err = {
                errors: {
                    message: 'Something went wrong when saving the vote to the database.'
                }
            };

            promiseMap.returnsPromise().rejects(err);

            votesController.create_vote(reqWithUser, res, next).then(function() {
                expect(next.withArgs(err).called).to.equal(true);
                done();
            });
        });

        it.skip('throws when bad parameters are passed', function() {
            var badReq = mockHttp.createRequest({
                method: 'POST',
                url: '/votes',
                user: {
                    _id: 'bbbbbbbbbbbbbbbbbbbbbbbb'
                },
                body: {
                    postId: 'aaaaaaaaaaaaa',
                    userId: 'bbbbbbbbbbbbbbbbbbbbbbbb'
                }
            });

            expect(votesController.create_vote(badReq, res, next).to.throw(Error));
        });
    });

    describe('vote_count', function() {
        var post, noti, next, id1, id2, id3,
            req, res, postMock, notiSave;
        var sandbox = sinon.sandbox.create();

        beforeEach(function() {
            id1 = mongoose.Types.ObjectId();
            id2 = mongoose.Types.ObjectId();
            id3 = mongoose.Types.ObjectId();


            next     = sandbox.spy();
            notiSave     = sandbox.stub(Notification.prototype, 'save');
            postMock = sandbox.mock(Post);

            req = mockHttp.createRequest({
                body: {
                    postId: id1.toString()
                }
            });

            res = mockHttp.createResponse();

            noti = new Notification();
        });

        afterEach(function() {
            sandbox.restore();
            noti = {};
            post = {};
        });

        it('returns when post is already hot', function(done) {
            post = new Post({
                _id: id2,
                voteCount: 5,
                hot: true
            });

            postMock
                .expects('findById')
                .chain('exec')
                .resolves(post);

            // Call the middleware function.
            votesController.vote_count(req, res, next).then(function() {
                postMock.verify();
                expect(notiSave.called).to.equal(false);
                expect(next.calledOnce).to.equal(false);
                done();
            });
        });

        it('creates new notification and saves it when post reaches vote count for hot', function(done) {
            post = new Post({
                _id: id2,
                voteCount: 3,
                hot: false
            });

            postMock
                .expects('findById')
                .chain('exec')
                .resolves(post);

            notiSave.returnsPromise().resolves();

            votesController.vote_count(req, res, next).then(function() {
                postMock.verify();
                expect(notiSave.calledOnce).to.equal(true);
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

/*
    describe('check_vote_count middleware', function() {
        var id1, id2, id3, id4, id5, hotPost, freshPost,
            notification, save, next, reqWithHotPost,
            reqWithFreshPost, res;
        var sandbox = sinon.sandbox.create();

        beforeEach(function() {
            id1 = mongoose.Types.ObjectId();
            id2 = mongoose.Types.ObjectId();
            id3 = mongoose.Types.ObjectId();
            id4 = mongoose.Types.ObjectId();
            id5 = mongoose.Types.ObjectId();

            next = sinon.spy();
            save = sandbox.stub(Notification.prototype, 'save');

            notification = new Notification({});

            hotPost = new Post({
                _id: id1,
                userId: id5,
                votes: [id2, id3, id4]
            });

            freshPost = new Post({
                _id: id1,
                userId: id5,
                votes: [id2, id3]
            });


            reqWithHotPost = mockHttp.createRequest({
                post: hotPost
            });

            reqWithFreshPost = mockHttp.createRequest({
                post: freshPost
            });

            res = mockHttp.createResponse();

        });

        afterEach(function() {
            hotPost = {};
            freshPost = {};
            notification = {};
            sandbox.restore();
        });

        it('creates, saves, and calls next with notification', function(done) {
            // post.votes.length must exceed votesForHot();
            // Stub votesForHot() so the test does not depend on the actual
            // return value of the function.

            save.returnsPromise().resolves(notification);

            // Call middleware function.
            votesController.check_vote_count(reqWithHotPost, res, next).then(function() {
                expect(save.called).to.equal(true);
                expect(next.calledOnce).to.equal(true);
                done();
            });
        });

        it('does not call save if voteCount is not enough', function() {
            save.returnsPromise().resolves();

            // Call middleware function.
            votesController.check_vote_count(reqWithFreshPost, res, next);
            expect(save.called).to.equal(false);
            expect(next.called).to.equal(false);
        });

        it('calls next(err) when save() rejects', function(done) {
            var err = {
                errors: {
                    message: 'Some error message.'
                }
            };

            save.returnsPromise().rejects(err);

            // Call middleware function.
            votesController.check_vote_count(reqWithHotPost, res, next).then(function() {
                expect(save.called).to.equal(true);
                expect(next.withArgs(err).called).to.equal(true);
                done();
            });
        });
    });

    describe('push_and_save_notification middleware', function() {
        var sandbox = sinon.sandbox.create();
        var id1, id2, notification, user,
            req, res, save, next, userMock;

        beforeEach(function() {
            id1 = mongoose.Types.ObjectId();
            id2 = mongoose.Types.ObjectId();

            notification = new Notification({
                _id: id2,
                userId: id1
            });

            req = mockHttp.createRequest({
                notification: notification
            });

            res = mockHttp.createResponse();

            save = sandbox.stub(User.prototype, 'save');
            next = sandbox.spy();
            userMock = sandbox.mock(User);
        });

        afterEach(function() {
            sandbox.restore();
            user = {};
            notification = {};
            req = {};
            res = {};
        });

        it('calls User.findById and user. save() when everything goes right', function(done) {
            user = new User({
                _id: id1,
                notifications: []
            });

            userMock
                .expects('findById')
                .chain('exec')
                .resolves(user);

            save.returnsPromise().resolves();

            // Call middleware function.
            votesController.push_and_save_notification(req, res, next).then(function() {
                userMock.verify();
                expect(save.called).to.equal(true);
                done();
            });
        });

        it('calls next(err) when User.findById rejects', function(done) {
            user = new User({
                _id: id1,
                notifications: []
            });

            var err = {
                errors: {
                    message: 'Some error message.'
                }
            };

            userMock
                .expects('findById')
                .chain('exec')
                .rejects(err);

            votesController.push_and_save_notification(req, res, next).then(function() {
                userMock.verify();
                expect(save.called).to.equal(false);
                expect(next.withArgs(err).calledOnce).to.equal(true);
                done();
            });
        });

        it('calls next(err) when user.save rejects', function(done) {
            user = new User({
                _id: id1,
                notifications: []
            });

            var err = {
                errors: {
                    message: 'Some error message.'
                }
            };

            userMock
                .expects('findById')
                .chain('exec')
                .resolves(user);

            save.returnsPromise().rejects(err);

            votesController.push_and_save_notification(req, res, next).then(function() {
                userMock.verify();
                expect(next.withArgs(err).calledOnce).to.equal(true);
                done();
            });
        });
    });
*/

    describe('delete_vote_user', function() {
        var reqWithUser, reqWithoutUser, res,
            id1, id2, id3, id4, id5,
            next, userMock, user, save;
        var sandbox = sinon.sandbox.create();

        beforeEach(function() {
            id1 = mongoose.Types.ObjectId();
            id2 = mongoose.Types.ObjectId();
            id3 = mongoose.Types.ObjectId();
            id4 = mongoose.Types.ObjectId();
            id5 = mongoose.Types.ObjectId();



            user = new User();

            reqWithUser = mockHttp.createRequest({
                method: 'DELETE',
                url: '/votes',
                user: {
                    _id: id1.toString()
                },
                body: {
                    postId: id2.toString()
                }
            });

            reqWithoutUser = mockHttp.createRequest({
                method: 'DELETE',
                url: '/votes',
                body: {
                    postId: id2.toString()
                }
            });

            res = mockHttp.createResponse();

            userMock = sandbox.mock(User);
            next     = sandbox.spy();
            save     = sandbox.stub(User.prototype, 'save');


        });

        afterEach(function() {
            sandbox.restore();
            reqWithoutUser = {};
            reqWithUser = {};
            res = {};
            user = {};
        });

        it('responds with 401 status if user is not authenticated', function() {
            votesController.delete_vote_user(reqWithoutUser, res, next);

            var data = JSON.parse(res._getData());

            expect(res.statusCode).to.equal(401);
            expect(data.message).to.equal('Please authenticate.');
        });

        it('responds with 403 status when postId is not among user.votePosts', function(done) {
            user = new User({
                _id: id1,
                votedPosts: [id5, id4, id3]
            });

            userMock
                .expects('findById')
                .chain('exec')
                .resolves(user);

            votesController.delete_vote_user(reqWithUser, res, next).then(function() {
                var data = JSON.parse(res._getData());

                userMock.verify();
                expect(res.statusCode).to.equal(403);
                expect(data.message).to.exist;
                expect(save.called).to.equal(false);
                expect(next.called).to.equal(false);
                done();
            });
        });


        it('makes the appropriate calls when everything goes right', function(done) {
            user = new User({
                _id: id1,
                votedPosts: [id5, id4, id3, id2]
            });

            userMock
                .expects('findById')
                .chain('exec')
                .resolves(user);

            save.returnsPromise().resolves();

            votesController.delete_vote_user(reqWithUser, res, next).then(function() {
                userMock.verify();
                expect(save.called).to.equal(true);
                expect(next.called).to.equal(true);
                done();
            });
        });

        it('calls next(err) when User.findById rejects', function(done) {
            var err = {
                errors: {
                    message: 'Some error message.'
                }
            };

            userMock
                .expects('findById')
                .chain('exec')
                .rejects(err);

            votesController.delete_vote_user(reqWithUser, res, next).then(function() {
                userMock.verify();
                expect(next.withArgs(err).called).to.equal(true);
                done();
            });
        });

        it('calls next(err) when user.save() rejects', function(done) {
            var err = {
                errors: {
                    message: 'Some error message.'
                }
            };

            user = new User({
                _id: id1,
                votedPosts: [id5, id4, id3, id2]
            });

            userMock
                .expects('findById')
                .chain('exec')
                .resolves(user);

            save.returnsPromise().rejects(err);

            votesController.delete_vote_user(reqWithUser, res, next).then(function() {
                userMock.verify();
                expect(save.called).to.equal(true);
                expect(next.withArgs(err).called).to.equal(true);
                done();
            });
        });

        it.skip('throws when bad parameters are passed', function() {
            var badReq = mockHttp.createRequest({
                user: {
                    _id: 'aaaaa'
                },
                body: {
                    postId: 'bbb'
                }
            });

            expect(votesController.delete_vote(badReq, res, next)).to.throw(Error);
        });
    });

    describe('delete_vote_post', function() {
        var req, res, next, postMock, save,
            post, id1, id2, id3;
        var sandbox = sinon.sandbox.create();

        beforeEach(function() {
            id1 = mongoose.Types.ObjectId();
            id1 = mongoose.Types.ObjectId();
            id1 = mongoose.Types.ObjectId();

            req = mockHttp.createRequest();
            res = mockHttp.createResponse();

            post = new Post({
                _id: id1,
                voteCount: 5
            });

            postMock = sandbox.mock(Post);
            save     = sandbox.stub(Post.prototype, 'save');
            next     = sandbox.spy();
        });

        afterEach(function() {
            sandbox.restore();
            req = {};
            res = {};
            post = {};
        });

        it('makes the appropriate calls when everything goes right', function(done) {
            postMock
                .expects('findById')
                .chain('exec')
                .resolves(post);

            save.returnsPromise().resolves();

            votesController.delete_vote_post(req, res, next).then(function() {
                var data = JSON.parse(res._getData());

                postMock.verify();
                expect(save.called).to.equal(true);
                expect(res.statusCode).to.equal(200);
                expect(data.message).to.exist;
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

            votesController.delete_vote_post(req, res, next).then(function() {
                postMock.verify();
                expect(save.called).to.equal(false);
                expect(next.withArgs(err).called).to.equal(true);
                done();
            });
        });

        it('calls next(err) when post.save() rejects', function(done) {
            var err = {
                errors: {
                    message: 'Some error message.'
                }
            };

            postMock
                .expects('findById')
                .chain('exec')
                .resolves(post);

            save.returnsPromise().rejects(err);

            votesController.delete_vote_post(req, res, next).then(function() {
                postMock.verify();
                expect(save.called).to.equal(true);
                expect(next.withArgs(err).called).to.equal(true);
                done();
            });
        });
    });
});