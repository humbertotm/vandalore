// Require controller
var notiController = require('../../../src/expressAppModules/controllers/notificationsController');

// Require models
var Notification = require('../../../src/expressAppModules/models/notificationModel');
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

describe('Notifactions controller', function() {
	describe('get_notifications', function() {
		var reqWithUser, reqWithoutUser, res, 
		id1, id2, id3, id4, id5,
		noti1, noti2, user, userMock;
		var sandbox = sinon.sandbox.create();

		beforeEach(function() {
			id1 = mongoose.Types.ObjectId();
			id2 = mongoose.Types.ObjectId();
			id3 = mongoose.Types.ObjectId();
			id4 = mongoose.Types.ObjectId();
			id5 = mongoose.Types.ObjectId();

			reqWithUser = mockHttp.createRequest({
				method: 'GET',
				url: '/notifications',
				user: {
					_id: id1
				},
				params: {
					userId: id1
				}
			});

			reqWithoutUser = mockHttp.createRequest({
				method: 'GET',
				url: '/notifications',
				params: {
					userId: id1
				}
			});

			res = mockHttp.createResponse();

			noti1 = new Notification({
				_id: id2,
				userId: id1,
				postId: id3,
				read: false,
				message: 'Some message.'
			});

			noti2 = new Notification({
				_id: id4,
				userId: id1,
				postId: id5,
				read: false,
				message: 'Some message.'
			});

			user = new User({
				_id: id1,
				notifications: [noti1, noti2]
			});

			userMock = sandbox.mock(User);
		});

		afterEach(function() {
			sandbox.restore();
			noti1 = {};
			noti2 = {};
			user = {};
			reqWithUser = {};
			reqWithoutUser = {};
			res = {};
		});

		it('responds with 401 status if no authenticated user', function() {
			notiController.get_notifications(reqWithoutUser, res);

			var data = JSON.parse(res._getData());

			expect(res.statusCode).to.equal(401);
			expect(data.message).to.equal('Please authenticate.');
		});

		it('successfully gets user notifications', function(done) {
			userMock
				.expects('findById')
				.chain('populate')
				.chain('exec')
				.resolves(user);

			notiController.get_notifications(reqWithUser, res).then(function() {
				var data = JSON.parse(res._getData());

				userMock.verify();
				expect(res.statusCode).to.equal(200);
				expect(data.length).to.equal(2);
				done();
			});
		});

		it('responds with err if User.findById() rejects', function(done) {
			var err = {
				errors: {
					message: 'Some error message.'
				}
			};

			userMock
				.expects('findById')
				.chain('populate')
				.chain('exec')
				.rejects(err);

			notiController.get_notifications(reqWithUser, res).then(function() {
				var data = JSON.parse(res._getData());

				userMock.verify();
				expect(res.statusCode).to.equal(500);
				expect(data.errors).to.exist;
				done();
			});		
		});
	});

	describe('mark_notification_as_read', function() {
		var reqWithUser, reqWithoutUser, res,
				id1, id2, id3, id4, noti,
				notiMock, save;
		var sandbox = sinon.sandbox.create();

		beforeEach(function() {
			id1 = mongoose.Types.ObjectId();
			id2 = mongoose.Types.ObjectId();
			id3 = mongoose.Types.ObjectId();
			id4 = mongoose.Types.ObjectId();

			noti = new Notification({
				_id: id2,
				userId: id1,
				postId: id3,
				read: false,
				message: 'Some message.'
			});

			reqWithUser = mockHttp.createRequest({
				method: 'PUT',
				url: '/notifications',
				user: {
					_id: id1
				},
				body: {
					notification: {
						_id: id2,
						userId: id1,
						postId: id3,
						read: false,
						message: 'Some message.'
					}
				}
			});

			reqWithoutUser = mockHttp.createRequest({
				method: 'PUT',
				url: '/notifications',
				body: {
					notification: {
						_id: id2,
						userId: id1,
						postId: id3,
						read: false,
						message: 'Some message.'
					}
				}
			});

			res = mockHttp.createResponse();

			notiMock = sandbox.mock(Notification);

			save = sandbox.stub(Notification.prototype, 'save');
		});

		afterEach(function() {
			sandbox.restore();
			reqWithUser = {};
			reqWithoutUser = {};
			res = {};
			noti = {};
		});

		it('responds with 401 status if no user is authenticated', function() {
			notiController.mark_notification_as_read(reqWithoutUser, res);

			var data = JSON.parse(res._getData());

			expect(res.statusCode).to.equal(401);
			expect(data.message).to.equal('Please authenticate.');
		});

		it('updates notification status to read successfully', function(done) {
			notiMock
				.expects('findById')
				.chain('exec')
				.resolves(noti);

			save.returnsPromise().resolves(noti);

			notiController.mark_notification_as_read(reqWithUser, res).then(function() {
				var data = JSON.parse(res._getData());

				notiMock.verify();
				expect(save.called).to.equal(true);
				expect(res.statusCode).to.equal(200);
				expect(data._id).to.exist;
				done();
			});
		});

		it('responds with 403 status if notification owner does not match req.user', function(done) {
			var reqWithUser1 = mockHttp.createRequest({
				method: 'PUT',
				url: '/notifications',
				user: {
					_id: id4
				},
				body: {
					notification: {
						_id: id2,
						userId: id1,
						postId: id3,
						read: false,
						message: 'Some message.'
					}
				}
			});

			notiMock
				.expects('findById')
				.chain('exec')
				.resolves(noti)

			notiController.mark_notification_as_read(reqWithUser1, res).then(function() {
				var data = JSON.parse(res._getData());

				notiMock.verify();
				expect(save.called).to.equal(false);
				expect(res.statusCode).to.equal(403);
				expect(data.message).to.equal('You are not authorized to perform this operation.');
				done();
			});
		});

		it('responds with err if Notification.findById() rejects', function(done) {
			var err = {
				errors: {
					message: 'Some error message.'
				}
			};

			notiMock
				.expects('findById')
				.chain('exec')
				.rejects(err);

			notiController.mark_notification_as_read(reqWithUser, res).then(function() {
				var data = JSON.parse(res._getData());

				notiMock.verify();
				expect(save.called).to.equal(false);
				expect(res.statusCode).to.equal(500);
				expect(data.errors).to.exist;
				done();	
			});
		});

		it('responds with err if noti.save() rejects', function(done) {
			var err = {
				errors: {
					message: 'Some error message.'
				}
			};

			notiMock
				.expects('findById')
				.chain('exec')
				.resolves(noti);

			save.returnsPromise().rejects(err);

			notiController.mark_notification_as_read(reqWithUser, res).then(function() {
				var data = JSON.parse(res._getData());

				notiMock.verify();
				expect(save.called).to.equal(true);
				expect(res.statusCode).to.equal(500);
				expect(data.errors).to.exist;
				done();	
			});
		});
	});
});