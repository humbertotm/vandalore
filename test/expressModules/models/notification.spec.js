var chai = require('chai');
var Notification = require('../../../src/expressAppModules/models/notificationModel');
var expect = chai.expect;

var User             = require('../../../src/expressAppModules/models/userModel');

var notiMid          = require('../../../src/expressAppModules/models/docMiddleware/notificationMid');

var Promise          = require('bluebird'),
    mongoose         = require('mongoose');
mongoose.Promise     = Promise;

var sinon            = require('sinon'),
    sinonStubPromise = require('sinon-stub-promise');

require('sinon-mongoose');
sinonStubPromise(sinon);

describe('Notification model', function() {
    var id;

    beforeEach(function() {
        id = require('mongoose').Types.ObjectId();
    });

    it('should be invalid if userId is not present', function(done) {
        var n = new Notification();

        n.validate(function(err) {
            expect(err.errors.userId).to.exist;
            done();
        });
    });

    it('should be invalid if postId is not present', function(done) {
        var n = new Notification({
            userId: id
        });

        n.validate(function(err) {
            expect(err.errors.postId).to.exist;
            done();
        });
    });

    it('read should be set to false by default', function(done) {
        var n = new Notification({
            userId: id,
            postId: id
        });

        expect(n.read).to.equal(false);
        done();
    });

    it('should be invalid if no message is present', function(done) {
        var n = new Notification({
            userId: id,
            postId: id
        });

        n.validate(function(err) {
            expect(err.errors.message).to.exist;
            done();
        });
    });

    it('should be valid', function(done) {
        var n = new Notification({
            userId: id,
            postId: id,
            message: 'Some message.'
        });

        n.validate(function(err) {
            expect(err).to.equal(null);
            done();
        });
    });
});

describe('Notification middleware', function() {
    describe('postSave middleware', function() {
        var doc, next, userMock, user,
            id1, id2, id3, save;
        var sandbox = sinon.sandbox.create();

        beforeEach(function() {
            id1 = mongoose.Types.ObjectId();
            id2 = mongoose.Types.ObjectId();
            id3 = mongoose.Types.ObjectId();

            doc = new Notification({
                _id: id1,
                userId: id2,
                postId: id3,
                read: false,
                messag: 'Some message.'
            });

            user = new User();

            next = sandbox.spy();
            userMock = sandbox.mock(User);
            save = sandbox.stub(User.prototype, 'save');
        });

        afterEach(function() {
            sandbox.restore();
            doc = {};
        });

        it('makes the appropriate calls when everything goes right', function(done) {
            userMock
                .expects('findById')
                .chain('exec')
                .resolves(user);

            save.returnsPromise().resolves();

            notiMid.postSave(doc, next).then(function() {
                userMock.verify();
                expect(save.called).to.equal(true);
                expect(next.called).to.equal(true);
                done();
            });
        });

        it('calls next(err) when User.findById() rejects', function(done) {
            var err = {
                errors: {
                    message: 'Some error.'
                }
            };

            userMock
                .expects('findById')
                .chain('exec')
                .rejects(err);

            notiMid.postSave(doc, next).then(function() {
                userMock.verify();
                expect(next.withArgs(err).called).to.equal(true);
                done();
            });
        });

        it('calls next(err) when user.save() rejects', function(done) {
            var err = {
                errors: {
                    message: 'Some error.'
                }
            };

            userMock
                .expects('findById')
                .chain('exec')
                .resolves(user);

            save.returnsPromise().rejects(err);

            notiMid.postSave(doc, next).then(function() {
                userMock.verify();
                expect(next.withArgs(err).called).to.equal(true);
                done();
            });
        });
    });
});