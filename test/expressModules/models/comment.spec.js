var chai = require('chai');
var Comment = require('../../../src/expressAppModules/models/commentModel');
var expect = chai.expect;

describe('Comment model', function() {
	var id;

	beforeEach(function() {
		id = require('mongoose').Types.ObjectId();
	});

	it('should be invalid if no userId is present', function(done) {
		var c = new Comment({});

		c.validate(function(err) {
			expect(err.errors.userId).to.exist;
			done();
		});
	});

	it('should be invalid if no postId is present', function(done) {
		var c = new Comment({ userId: id });

		c.validate(function(err) {
			expect(err.errors.postId).to.exist;
			done();
		});
	});

	it('should be invalid if no content is present', function(done) {
		var c = new Comment({
			userId: id,
			postId: id
		});

		c.validate(function(err) {
			expect(err.errors.content).to.exist;
			done();
		});
	});

	it('should be valid invalid if content exceeds 140 characters', function(done) {
		var contentA = Array(142).join('a');
		var c = new Comment({
			userId: id,
			postId: id,
			content: contentA
		});

		c.validate(function(err) {
			expect(err.errors.content).to.exist;
			done();
		});
	});

	it('should be valid', function(done) {
		var contentA = Array(110).join('a');
		var c = new Comment({
			userId: id,
			postId: id,
			content: contentA
		});

		c.validate(function(err) {
			expect(err).to.equal(null);
			done();
		});
	});
});