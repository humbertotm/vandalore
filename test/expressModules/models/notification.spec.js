var chai = require('chai');
var Notification = require('../../../src/expressAppModules/models/notificationModel');
var expect = chai.expect;

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