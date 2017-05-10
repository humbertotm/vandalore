// Require controller
var votesController = require('../../../src/expressAppModules/controllers/votesController');

// Require models
var Vote = require('../../../src/expressAppModules/models/voteModel');
var User = require('../../../src/expressAppModules/models/userModel');
var Post = require('../../../src/expressAppModules/models/postModel');
var Notification = require('../../../src/expressAppModules/models/notificationModel');

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

// Requiring the app (needed to test with chaiHttp)
// var server = require('../../../src/server');

// Require mongoose.
var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');

describe.only('Votes controller', function() {
	describe('create_vote', function() {
		var reqWithUser, reqWithoutUser, res, vote, 
				id1, id2, id3, err, next, save;
		var sandbox = sinon.sandbox.create();

		beforeEach(function() {
			res = mockHttp.createResponse();
			
			reqWithUser = mockHttp.createRequest({
				method: 'POST',
				url: '/votes',
				user: {
					_id: id1
				},
				body: {
					postId: id2,
					userId: id1
				}
			});

			reqWithoutUser = mockHttp.createRequest({
				method: 'POST',
				url: '/votes',
				body: {
					postId: id1,
					userId: id2
				}
			});

			next = sandbox.spy();

			save = sandbox.stub(Vote.prototype, 'save');

			id1 = mongoose.Types.ObjectId();
			id2 = mongoose.Types.ObjectId();
			id3 = mongoose.Types.ObjectId();		
		});

		afterEach(function() {
			sandbox.restore();
			reqWithUser = {};
			reqWithoutUser = {};
			res = {};
			vote = {};
			err = {};
		});

		it('Sends response with 401 status and message if no user is authenticated', function() {
			votesController.create_vote(reqWithoutUser, res, next);

			var data = JSON.parse(res._getData());
			expect(res.statusCode).to.equal(401);
			expect(data.message).to.equal('Please authenticate.');
		});
	
		it('Returns a newly created vote', function(done) {
			vote = new Vote({
				_id: id3,
				userId: id1,
				postId: id2
			});

			save.returnsPromise().resolves(vote);
			
			votesController.create_vote(reqWithUser, res, next).then(function() {
				var data = JSON.parse(res._getData());

				expect(save.called).to.equal(true);
				expect(res.statusCode).to.equal(200);
				expect(data).to.exist;
				expect(next.withArgs(vote).calledOnce).to.equal(true);
				done();
			});
		});

		it('Responds with error when saving vote fails', function(done) {
			err = {
				errors: {
					message: 'Something went wrong when saving the vote to the database.'
				} 
			};

			save.returnsPromise().rejects(err);

			votesController.create_vote(reqWithUser, res, next).then(function() {
				var data = JSON.parse(res._getData());
				
				expect(res.statusCode).to.equal(500);
				expect(data.errors).to.exist;
				done();
			});
		});
	});

	describe('push_and_save_vote middleware', function() {
		var vote, user, post, next, id1, id2, id3;
		var sandbox = sinon.sandbox.create();

		beforeEach(function() {
			id1 = mongoose.Types.ObjectId();
			id2 = mongoose.Types.ObjectId();
			id3 = mongoose.Types.ObjectId();
			
			vote = new Vote({
				_id: id3,
				userId: id1,
				postId: id2
			});

			next = sandbox.spy();
		});

		afterEach(function() {
			sandbox.restore();
			vote = {};
			user = {};
			post = {};
		});

		it('makes the appropriate calls when everything goes right', function(done) {
			user = new User({
				_id: id1,
				votes: []
			});

			post = new Post({
				_id: id2,
				votes: []
			});

			var userSave = sandbox.stub(User.prototype, 'save');
			var postSave = sandbox.stub(Post.prototype, 'save');
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

			userSave.returnsPromise().resolves();
			postSave.returnsPromise().resolves();
			promiseAll.returnsPromise().resolves([user, post]);

			// Call the middleware function.
			votesController.push_and_save_vote(vote, next).then(function() {
				expect(promiseAll.called).to.equal(true);
				userMock.verify();
				postMock.verify();
				expect(userSave.called).to.equal(true);
				expect(postSave.called).to.equal(true);
				expect(next.withArgs(post).calledOnce).to.equal(true);
				done();
			});
		});

		it('logs error to the console when Promise.all rejects', function(done) {
			var consoleLog = sandbox.stub(console, 'log');
			var promiseAll = sandbox.stub(Promise, 'all');

			var err = {
				errors: {
					message: 'Some error message.'
				}
			}

			promiseAll.returnsPromise().rejects(err);

			// Call middleware function.
			votesController.push_and_save_vote(vote, next).then(function() {
				expect(promiseAll.called).to.equal(true);
				expect(next.called).to.equal(false);
				expect(consoleLog.called).to.equal(true);
				done();
			});
		});
	});

	describe('check_vote_count middleware', function() {
		var id1, id2, id3, id4, post, 
				notification, save, next;
		var sandbox = sinon.sandbox.create();

		beforeEach(function() {
			id1 = mongoose.Types.ObjectId();
			id2 = mongoose.Types.ObjectId();
			id3 = mongoose.Types.ObjectId();
			id4 = mongoose.Types.ObjectId();
			notification = new Notification();
			next = sinon.spy();
			save = sandbox.stub(Notification.prototype, 'save');
			

		});

		afterEach(function() {
			post = {};
			notification = {};
			sandbox.restore();
		});

		it('creates, saves, and calls next with notification', function(done) {
			// post.votes.length must exceed votesForHot();
			// Stub votesForHot() so the test does not depend on the actual 
			// return value of the function.
			post = new Post({
				_id: id1,
				votes: [id2, id3, id4]
			});

			save.returnsPromise().resolves(notification);

			// Call middleware function.
			votesController.check_vote_count(post, next).then(function() {
				expect(save.called).to.equal(true);
				expect(next.withArgs(notification).calledOnce).to.equal(true);
				done();
			});
		});

		it('does not call save if voteCount is not enough', function() {
			post = new Post({
				_id: id1,
				votes: [id2, id3]
			});

			save.returnsPromise().resolves();

			// Call middleware function.
			votesController.check_vote_count(post, next);	
			expect(save.called).to.equal(false);	
		});

		it('logs error to the console', function(done) {
			post = new Post({
				_id: id1,
				votes: [id2, id3, id4]
			});

			var consoleLog = sandbox.stub(console, 'log');

			var err = {
				errors: {
					message: 'Some error message.'
				}
			};

			save.returnsPromise().rejects(err);

			// Call middleware function.
			votesController.check_vote_count(post, next).then(function() {
				expect(save.called).to.equal(true);
				expect(consoleLog.withArgs(err).calledOnce).to.equal(true);
				done();
			});
		});
	});

	describe('push_and_save_notification middleware', function() {
		var sandbox = sinon.sandbox.create();
		var id1, id2, notification, user;

		beforeEach(function() {
			id1 = mongoose.Types.ObjectId();
			id2 = mongoose.Types.ObjectId();
			
			notification = new Notification({
				_id: id2,
				userId: id1
			});
		});

		afterEach(function() {
			sandbox.restore();
			user = {};
			notification = {};
		});

		it('calls User.findById and user. save() when everything goes right', function(done) {
			user = new User({
				_id: id1,
				notifications: []
			});

			var userMock = sandbox.mock(User);

			userMock
				.expects('findById')
				.chain('exec')
				.resolves(user);

			var save = sandbox.stub(User.prototype, 'save');
			save.returnsPromise().resolves();

			// Call middleware function.
			votesController.push_and_save_notification(notification).then(function() {
				userMock.verify();
				expect(save.called).to.equal(true);
				done();
			});
		});

		it('logs error to the console if User.findById rejects', function(done) {
			user = new User({
				_id: id1,
				notifications: []
			});

			var err = {
				errors: {
					message: 'Some error message.'
				}
			};

			var userMock = sandbox.mock(User);

			userMock
				.expects('findById')
				.chain('exec')
				.rejects(err);

			var consoleLog = sandbox.stub(console, 'log');

			votesController.push_and_save_notification(notification).then(function() {
				userMock.verify();
				expect(consoleLog.withArgs(err).calledOnce).to.equal(true);
				done();
			});
		});

		it('logs error to the console when user.save rejects', function(done) {
			user = new User({
				_id: id1,
				notifications: []
			});

			var err = {
				errors: {
					message: 'Some error message.'
				}
			};

			var userMock = sandbox.mock(User);

			userMock
				.expects('findById')
				.chain('exec')
				.resolves(user);

			var save = sandbox.stub(User.prototype, 'save');
			save.returnsPromise().rejects(err);

			var consoleLog = sandbox.stub(console, 'log');

			votesController.push_and_save_notification(notification).then(function() {
				userMock.verify();
				expect(consoleLog.withArgs(err).calledOnce).to.equal(true);
				done();
			});
		});
	});

	describe('delete_vote', function() {
		var reqWithUser, reqWithoutUser, res, id1, id2, id3, id4, id5,
		 		vote, remove, voteMock;
		var sandbox = sinon.sandbox.create();

		beforeEach(function() {
			id1 = mongoose.Types.ObjectId();
			id2 = mongoose.Types.ObjectId();
			id3 = mongoose.Types.ObjectId();
			id4 = mongoose.Types.ObjectId();
			id5 = mongoose.Types.ObjectId();

			remove = sandbox.stub(Vote.prototype, 'remove');

			vote = new Vote({
				_id: id3,
				postId: id2,
				userId: id1
			});
			
			reqWithUser = mockHttp.createRequest({
				method: 'DELETE',
				url: '/votes',
				user: {
					_id: id1
				},
				body: {
					vote: {
						_id: id3,
						postId: id2,
						userId: id1
					}
				}
			});

			reqWithoutUser = mockHttp.createRequest({
				method: 'DELETE',
				url: '/votes',
				body: {
					vote: {
						_id: id3,
						postId: id2,
						userId: id1
					}
				}
			});

			voteMock = sandbox.mock(Vote);

			res = mockHttp.createResponse();
		});

		afterEach(function() {
			sandbox.restore();
			reqWithoutUser = {};
			reqWithUser = {};
			res = {};
			vote = {};
		});

		it('responds with 401 status if user is not authenticated', function() {
			votesController.delete_vote(reqWithoutUser, res);

			var data = JSON.parse(res._getData());

			expect(res.statusCode).to.equal(401);
			expect(data.message).to.equal('Please authenticate.');
		});


		it('makes the appropriate calls when everything goes right', function(done) {
			voteMock
				.expects('findById')
				.chain('exec')
				.resolves(vote);

			remove.returnsPromise().resolves(vote);

			votesController.delete_vote(reqWithUser, res).then(function() {
				var data = JSON.parse(res._getData());

				voteMock.verify();
				expect(remove.called).to.equal(true);
				expect(res.statusCode).to.equal(200);
				expect(data.message).to.exist;
				expect(data.message).to.equal('Vote successfully deleted.');
				expect(data.vote).to.exist;
				done();
			});
		});

		it('responds with 403 status when req.user._id does not match vote owner', function(done) {
			var vote1 = new Vote({
				_id: id4,
				postId: id2,
				userId: id5
			});

			voteMock
				.expects('findById')
				.chain('exec')
				.resolves(vote1);

			votesController.delete_vote(reqWithUser, res).then(function() {
				var data = JSON.parse(res._getData());

				voteMock.verify();
				expect(remove.called).to.equal(false);
				expect(res.statusCode).to.equal(403);
				expect(data.message).to.equal('You are not authorized to perform this operation.');
				done();
			});
		});

		it('responds with err when Vote.findById rejects', function(done) {
			var err = {
				errors: {
					message: 'Some error message.'
				}
			};

			voteMock
				.expects('findById')
				.chain('exec')
				.rejects(err);

			votesController.delete_vote(reqWithUser, res).then(function() {
				var data = JSON.parse(res._getData());

				voteMock.verify();
				expect(res.statusCode).to.equal(500);
				expect(data.errors).to.exist;
				done();
			});
		});

		it('responds with err when vote.remove rejects', function(done) {
			var err = {
				errors: {
					message: 'Some error message.'
				}
			};

			voteMock
				.expects('findById')
				.chain('exec')
				.resolves(vote);

			remove.returnsPromise().rejects(err);

			votesController.delete_vote(reqWithUser, res).then(function() {
				var data = JSON.parse(res._getData());

				voteMock.verify();
				expect(remove.called).to.equal(true);
				expect(res.statusCode).to.equal(500);
				expect(data.errors).to.exist;
				done();
			});
		});
	});
});