// Require controller
var relController    = require('../../../src/expressAppModules/controllers/relationshipsController');

// Require models
var User             = require('../../../src/expressAppModules/models/userModel');

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

describe('Relationships controller', function() {
    describe('verify_docs', function() {
        var reqWithUser, reqWithoutUser, res,
            id1, id2, id3, promiseAll, err, next,
            follower, followed, userMock;
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
                    followedId: id2.toString()
                }
            });

            reqWithoutUser = mockHttp.createRequest({
                body: {
                    postId: id2.toString()
                }
            });

            res = mockHttp.createResponse({});

            userMock = sandbox.mock(User);

            follower = new User();
            followed = new User();

            next = sandbox.spy();
            promiseAll = sandbox.stub(Promise, 'all');

        });

        afterEach(function() {
            reqWithUser = {};
            reqWithoutUser = {};
            res = {};
            follower = {};
            followed = {};
            sandbox.restore();
        });

        it('responds with 401 status when no user is authenticated', function() {
            relController.verify_docs(reqWithoutUser, res, next);

            var data = JSON.parse(res._getData());

            expect(res.statusCode).to.equal(401);
            expect(data.message).to.equal('Please authenticate.');
        });

        it('calls next() when everything goes right', function(done) {
            follower._id = id1;
            followed._id = id2;

            userMock
                .expects('find')
                .chain('exec')
                .resolves();

            promiseAll.returnsPromise().resolves([follower, followed]);

            relController.verify_docs(reqWithUser, res, next).then(function() {
                userMock.verify();
                expect(promiseAll.called).to.equal(true);
                expect(next.called).to.equal(true);
                done();
            });
        });

        it('responds with 404 status when only one user is returned by User.find()', function(done) {
            userMock
                .expects('find')
                .chain('exec')
                .resolves();

            promiseAll.returnsPromise().resolves(follower);

            relController.verify_docs(reqWithUser, res, next).then(function() {
                var data = JSON.parse(res._getData());

                userMock.verify();
                expect(promiseAll.called).to.equal(true);
                expect(next.called).to.equal(false);
                expect(res.statusCode).to.equal(404);
                expect(data.message).to.equal('Follower and/or followed user not found.');
                done();
            });
        });

        it('responds with 404 status when follower is null', function(done) {
            userMock
                .expects('find')
                .chain('exec')
                .resolves();

            promiseAll.returnsPromise().resolves([null, followed]);

            relController.verify_docs(reqWithUser, res, next).then(function() {
                var data = JSON.parse(res._getData());

                userMock.verify();
                expect(promiseAll.called).to.equal(true);
                expect(next.called).to.equal(false);
                expect(res.statusCode).to.equal(404);
                expect(data.message).to.equal('Follower and/or followed user not found.');
                done();
            });
        });

        it('responds with 404 status when followed is null', function(done) {
            userMock
                .expects('find')
                .chain('exec')
                .resolves();

            promiseAll.returnsPromise().resolves([follower, null]);

            relController.verify_docs(reqWithUser, res, next).then(function() {
                var data = JSON.parse(res._getData());

                userMock.verify();
                expect(promiseAll.called).to.equal(true);
                expect(next.called).to.equal(false);
                expect(res.statusCode).to.equal(404);
                expect(data.message).to.equal('Follower and/or followed user not found.');
                done();
            });
        });

        it('calls next(err) when Promise.all() rejects', function() {
            err = {};
            promiseAll.returnsPromise().rejects(err);

            relController.verify_docs(reqWithUser, res, next).then(function(done) {
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
                    followedId: 'aaaa'
                }
            });

            expect(function() {
                relController.verify_docs(badReq, res, next);
            }).to.throw(Error);
        });
    });

    describe('create_relationship', function() {
        var id1, id2, id3, id4, id5,
            follower, followed, res,
            req, next, save, promiseAll;
        var sandbox = sinon.sandbox.create();

        beforeEach(function() {
            id1 = mongoose.Types.ObjectId();
            id2 = mongoose.Types.ObjectId();
            id3 = mongoose.Types.ObjectId();
            id4 = mongoose.Types.ObjectId();
            id5 = mongoose.Types.ObjectId();

            next = sandbox.spy();
            save = sandbox.stub(User.prototype, 'save');
            promiseAll = sandbox.stub(Promise, 'all');

            follower = new User();
            followed = new User();

            req = mockHttp.createRequest({
                method: 'POST',
                url: '/relationships',
                follower: follower,
                followed: followed
            });
            res = mockHttp.createResponse();
        });

        afterEach(function() {
            sandbox.restore();
            follower = {};
            followed = {};
            req = {};
            res = {};
        });

        it('responds with 309 if a relationship already exists, case 1', function() {
            follower._id = id1;
            followed._id = id2;
            follower.following = [id3, id2, id4];
            followed.followers = [id4, id1];

            relController.create_relationship(req, res, next);

            var data = JSON.parse(res._getData());

            expect(res.statusCode).to.equal(309);
            expect(data.message).to.equal('A relationship between this users already exists.');
        });

        it('responds with 309 if a relationship already exists, case 2', function(done) {
            follower._id = id1;
            followed._id = id2;
            follower.following = [id3, id2, id4];
            followed.followers = [id4, id3];

            save.returnsPromise().resolves();

            relController.create_relationship(req, res, next).then(function() {
                var data = JSON.parse(res._getData());

                expect(save.calledOnce).to.equal(true);
                expect(next.called).to.equal(false);
                expect(res.statusCode).to.equal(309);
                expect(data.message).to.equal('A relationship between this users already exists.');
                done();
            });
        });

        it('calls next(err) when followed.save() rejects, case 2', function(done) {
            follower._id = id1;
            followed._id = id2;
            follower.following = [id3, id2, id4];
            followed.followers = [id4, id3];

            var err = {};

            save.returnsPromise().rejects(err);

            relController.create_relationship(req, res, next).then(function() {
                expect(save.calledOnce).to.equal(true);
                expect(next.withArgs(err).calledOnce).to.equal(true);
                done();
            });
        });

        it('responds with newly created relationship, case 3', function(done) {
            follower._id = id1;
            followed._id = id2;
            follower.following = [id3, id4];
            followed.followers = [id4, id3, id1];


            save.returnsPromise().resolves();

            relController.create_relationship(req, res, next).then(function() {
                var data = JSON.parse(res._getData());

                expect(save.calledOnce).to.equal(true);
                expect(res.statusCode).to.equal(200);
                expect(data.message).to.equal('Relationship successfully created.');
                expect(data.followedId).to.exist;
                done();
            });
        });

        it('calls next(err) when follower.save() rejects, case 3', function(done) {
            follower._id = id1;
            followed._id = id2;
            follower.following = [id3, id4];
            followed.followers = [id4, id3, id1];

            var err = {};

            save.returnsPromise().rejects(err);

            relController.create_relationship(req, res, next).then(function() {
                expect(save.calledOnce).to.equal(true);
                expect(next.withArgs(err).calledOnce).to.equal(true);
                done();
            });
        });

        it('responds with a newly created relationship, case 4', function(done) {
            follower._id = id1;
            followed._id = id2;
            follower.following = [id3, id4];
            followed.followers = [id4, id3];

            promiseAll.returnsPromise().resolves();

            relController.create_relationship(req, res, next).then(function() {
                var data = JSON.parse(res._getData());

                expect(promiseAll.called).to.equal(true);
                // expect(save.calledTwice).to.equal(true);
                expect(res.statusCode).to.equal(200);
                expect(data.message).to.equal('Relationship successfully created.');
                expect(data.followedId).to.exist;
                expect(next.calledOnce).to.equal(false);
                done();
            });
        });

        it('calls next(err) when Promise.all() rejects', function(done) {
            var err = {
                errors: {
                    message: 'Some error message.'
                }
            }

            promiseAll.returnsPromise().rejects(err);

            relController.create_relationship(req, res, next).then(function() {
                expect(promiseAll.called).to.equal(true);
                expect(next.withArgs(err).called).to.equal(true);
                done();
            });
        });
    });

    describe('delete_relationship', function() {
        var req, res, follower, followed,
            id1, id2, id3, id4, id5,
            save, next, promiseAll;
        var sandbox = sinon.sandbox.create();

        beforeEach(function() {
            id1 = mongoose.Types.ObjectId();
            id2 = mongoose.Types.ObjectId();
            id3 = mongoose.Types.ObjectId();
            id4 = mongoose.Types.ObjectId();
            id5 = mongoose.Types.ObjectId();

            follower = new User();
            followed = new User();

            req = mockHttp.createRequest({
                follower: follower,
                followed: followed
            });

            res = mockHttp.createResponse();

            save = sandbox.stub(User.prototype, 'save');
            next = sandbox.spy();
            promiseAll = sandbox.stub(Promise, 'all');
        });

        afterEach(function() {
            sandbox.restore();
            res = {};
            req = {};
            follower = {};
            followed = {};
        });

        it('responds with 404 if relationship is not found, case 1', function() {
            follower._id = id1;
            followed._id = id2;
            follower.following = [id3, id4];
            followed.followers = [id4, id2];

            relController.delete_relationship(req, res, next);

            var data = JSON.parse(res._getData());

            expect(res.statusCode).to.equal(404);
            expect(data.message).to.equal('Relationship not found.');
        });

        it('responds with 404 if relationship is not found, case 2', function(done) {
            follower._id = id1;
            followed._id = id2;
            follower.following = [id3, id4];
            followed.followers = [id4, id1, id3];

            save.returnsPromise().resolves();

            relController.delete_relationship(req, res, next).then(function() {
                var data = JSON.parse(res._getData());

                expect(save.calledOnce).to.equal(true);
                expect(next.called).to.equal(false);
                expect(res.statusCode).to.equal(404);
                expect(data.message).to.equal('Relationship not found.');
                done();
            });
        });

        it('calls next(err) when followed.save() rejects, case 2', function(done) {
            follower._id = id1;
            followed._id = id2;
            follower.following = [id3, id4];
            followed.followers = [id4, id1, id3];

            var err = {};

            save.returnsPromise().rejects(err);

            relController.delete_relationship(req, res, next).then(function() {
                expect(save.calledOnce).to.equal(true);
                expect(next.withArgs(err).calledOnce).to.equal(true);
                done();
            });
        });

        it('relationship successfully deleted, case 3', function(done) {
            follower._id = id1;
            followed._id = id2;
            follower.following = [id3, id2, id4];
            followed.followers = [id4, id3];

            save.returnsPromise().resolves();

            relController.delete_relationship(req, res, next).then(function() {
                var data = JSON.parse(res._getData());

                expect(save.calledOnce).to.equal(true);
                expect(res.statusCode).to.equal(200);
                expect(data.message).to.equal('Relationship successfully deleted.');
                expect(data.followedId).to.exist;
                done();
            });
        });

        it('calls next(err) when follower.save() rejects, case 3', function(done) {
            follower._id = id1;
            followed._id = id2;
            follower.following = [id3, id2, id4];
            followed.followers = [id4, id3];

            var err = {};

            save.returnsPromise().rejects(err);

            relController.delete_relationship(req, res, next).then(function() {
                expect(save.calledOnce).to.equal(true);
                expect(next.withArgs(err).calledOnce).to.equal(true);
                done();
            });
        });

        it('responds with successfully deleted relationship, case 4', function(done) {
            follower._id = id1;
            followed._id = id2;
            follower.following = [id3, id2, id4];
            followed.followers = [id4, id3, id1];

            promiseAll.returnsPromise().resolves();

            relController.delete_relationship(req, res, next).then(function() {
                var data = JSON.parse(res._getData());

                expect(promiseAll.called).to.equal(true);
                // expect(save.calledTwice).to.equal(true);
                expect(res.statusCode).to.equal(200);
                expect(data.message).to.equal('Relationship successfully deleted.');
                expect(data.followedId).to.exist;
                expect(next.calledOnce).to.equal(false);
                done();
            });
        });

        it('calls next(err) when Promise.all() rejects', function(done) {
            follower._id = id1;
            followed._id = id2;
            follower.following = [id3, id2, id4];
            followed.followers = [id4, id3, id1];

            var err = {
                errors: {
                    message: 'Some error message.'
                }
            }

            promiseAll.returnsPromise().rejects(err);

            relController.delete_relationship(req, res, next).then(function() {
                expect(promiseAll.called).to.equal(true);
                expect(next.withArgs(err).called).to.equal(true);
                done();
            });
        });
    });
});