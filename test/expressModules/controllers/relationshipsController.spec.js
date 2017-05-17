// Require controller
var relController = require('../../../src/expressAppModules/controllers/relationshipsController');

// Require models
var Relationship = require('../../../src/expressAppModules/models/relationshipModel');
var User = require('../../../src/expressAppModules/models/userModel');

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

describe('Relationships controller', function() {
    describe('create_relationship', function() {
        var id1, id2, id3, rel, follower, followed, res,
            reqWithUser, reqWithoutUser, next, save;
        var sandbox = sinon.sandbox.create();

        beforeEach(function() {
            id1 = mongoose.Types.ObjectId();
            id2 = mongoose.Types.ObjectId();
            id3 = mongoose.Types.ObjectId();
            next = sandbox.spy();
            save = sandbox.stub(Relationship.prototype, 'save');

            reqWithUser = mockHttp.createRequest({
                method: 'POST',
                url: '/relationships',
                user: {
                    _id: id1
                },
                body: {
                    followedId: id2
                }
            });

            reqWithoutUser = mockHttp.createRequest({
                method: 'POST',
                url: '/relationships',
                body: {
                    followedId: id2
                }
            });

            res = mockHttp.createResponse();

            rel = new Relationship({
                _id: id3,
                followedId: id2,
                followerId: id1
            });
        });

        afterEach(function() {
            sandbox.restore();
            rel = {};
            follower = {};
            followed = {};
            reqWithUser = {};
            reqWithoutUser = {};
            res = {};
        });

        it('sends 401 response when there is no authenticated user', function() {
            relController.create_relationship(reqWithoutUser, res, next);

            var data = JSON.parse(res._getData());

            expect(res.statusCode).to.equal(401);
            expect(data.message).to.equal('Please authenticate.');
        });

        it('responds with a newly created relationship', function(done) {
            save.returnsPromise().resolves(rel);

            relController.create_relationship(reqWithUser, res, next).then(function() {
                var data = JSON.parse(res._getData());

                expect(save.called).to.equal(true);
                expect(res.statusCode).to.equal(200);
                expect(data.followedId).to.exist;
                expect(next.calledOnce).to.equal(true);
                done();
            });
        });

        it('responds with 500 status and error message when rel.save() rejects', function(done) {
            var err = {
                errors: {
                    message: 'Some error message.'
                }
            }

            save.returnsPromise().rejects(err);

            relController.create_relationship(reqWithUser, res, next).then(function() {
                var data = JSON.parse(res._getData());

                expect(save.called).to.equal(true);
                expect(next.called).to.equal(false);
                expect(res.statusCode).to.equal(500);
                expect(data.errors).to.exist;
                done();
            });
        });
    });

    describe('push_and_save_rel middleware', function() {
        var id1, id2, id3, rel, save, follower, followed,
            consoleLog, promiseAll, userMock;
        var sandbox = sinon.sandbox.create();

        beforeEach(function() {
            id1 = mongoose.Types.ObjectId();
            id2 = mongoose.Types.ObjectId();
            id3 = mongoose.Types.ObjectId();

            save = sandbox.spy(User.prototype, 'save');
            consoleLog = sandbox.stub(console, 'log');
            promiseAll = sandbox.stub(Promise, 'all');

            follower = new User({
                _id: id1,
                following: []
            });

            followed: new User({
                _id: id2,
                followers: []
            });

            rel = new Relationship({
                _id: id3,
                followerId: id1,
                followedId: id2
            });

            userMock = sandbox.mock(User);
        });

        afterEach(function() {
            sandbox.restore();
            follower = {};
            followed = {};
            rel = {};
        });

        it.skip('makes the appropriate calls when everything goes right', function(done) {
            // Not working.
            // Not sure expectations are correctly defined.
            userMock
                .expects('findById')
                .chain('exec')
                .resolves();

            promiseAll.returnsPromise().resolves([follower, followed]);

            relController.push_and_save_rel(rel).then(function() {
                userMock.verify();
                expect(promiseAll.called).to.equal(true);
                // Calling only once.
                // expect(save.callCount).to.equal(1);
                done();
            });
        });
    });

    describe('delete_relationship', function() {
        var reqWithUser, reqWithoutUser, res,
            id1, id2, id3, id4, id5, rel,
            relMock, remove;
        var sandbox = sinon.sandbox.create();

        beforeEach(function() {
            id1 = mongoose.Types.ObjectId();
            id2 = mongoose.Types.ObjectId();
            id3 = mongoose.Types.ObjectId();
            id4 = mongoose.Types.ObjectId();
            id5 = mongoose.Types.ObjectId();

            reqWithUser = mockHttp.createRequest({
                method: 'DELETE',
                url: '/relationships',
                user: {
                    _id: id1
                },
                body: {
                    _id: id4,
                    followerId: id1,
                    followedId: id2
                }
            });

            reqWithoutUser = mockHttp.createRequest({
                method: 'DELETE',
                url: '/relationships',
                body: {
                    _id: id2
                }
            });

            res = mockHttp.createResponse();

            rel = new Relationship({
                _id: id4,
                followerId: id1,
                followedId: id2
            });

            relMock = sandbox.mock(Relationship);
            remove = sandbox.stub(Relationship.prototype, 'remove');
        });

        afterEach(function() {
            sandbox.restore();
            res = {};
            reqWithUser = {};
            reqWithoutUser = {};
            rel = {};
        });

        it('returns 401 if no user is authenticated', function() {
            relController.delete_relationship(reqWithoutUser, res);

            var data = JSON.parse(res._getData());

            expect(remove.called).to.equal(false);
            expect(res.statusCode).to.equal(401);
            expect(data.message).to.equal('Please authenticate.');
        });

        it('successfully deletes relationship and sends 200 res', function(done) {
            relMock
                .expects('findById')
                .chain('exec')
                .resolves(rel);

            remove.returnsPromise().resolves();

            relController.delete_relationship(reqWithUser, res).then(function() {
                var data = JSON.parse(res._getData());

                relMock.verify();
                expect(remove.called).to.equal(true);
                expect(res.statusCode).to.equal(200);
                expect(data.message).to.equal('Relationship successfully deleted.');
                expect(data.relationshipId).to.exist;
                done();
            });
        });

        it('respnds with 403 status when req.user._id does not match followedId', function(done) {
            var rel1 = new Relationship({
                _id: id3,
                followerId: id2,
                followedId: id1
            });

            relMock
                .expects('findById')
                .chain('exec')
                .resolves(rel1);

            relController.delete_relationship(reqWithUser, res).then(function() {
                var data = JSON.parse(res._getData());

                relMock.verify();
                expect(remove.called).to.equal(false);
                expect(res.statusCode).to.equal(403);
                expect(data.message).to.equal('You are not authorized to perform this operation.');
                done();
            });
        });

        it('responds with err when Relationship.findById() rejects', function(done) {
            var err = {
                errors: {
                    message: 'Some error message.'
                }
            };

            relMock
                .expects('findById')
                .chain('exec')
                .rejects(err);

            relController.delete_relationship(reqWithUser, res).then(function() {
                var data = JSON.parse(res._getData());

                relMock.verify();
                expect(res.statusCode).to.equal(500);
                expect(data.errors).to.exist;
                done();
            });
        });

        it('responds with err when rel.remove() rejects', function(done) {
            var err = {
                errors: {
                    message: 'Some error message.'
                }
            };

            relMock
                .expects('findById')
                .chain('exec')
                .resolves(rel);

            remove.returnsPromise().rejects(err);

            relController.delete_relationship(reqWithUser, res).then(function() {
                var data = JSON.parse(res._getData());

                relMock.verify();
                expect(remove.called).to.equal(true);
                expect(res.statusCode).to.equal(500);
                expect(data.errors).to.exist;
                done();
            });
        });
    });
});