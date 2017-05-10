var chai = require('chai');
var Relationship = require('../../../src/expressAppModules/models/relationshipModel');
var expect = chai.expect;

describe('Relationship model', function() {
	var id;

	beforeEach(function() {
		id = require('mongoose').Types.ObjectId();
	});

	it('should be valid', function(done) {
		var r = new Relationship({
			followedId: id,
			followerId: id
		});

		r.validate(function(err) {
			expect(err).to.equal(null);
			done();
		});
	});

	it('should be invalid if followerId is missing', function(done) {
		var r = new Relationship({
			followedId: id
		});

		r.validate(function(err) {
			expect(err.errors.followerId).to.exist;
			done();
		});
	});

	it('should be invalid if followedId is missing', function(done) {
		var r = new Relationship({
			followerId: id
		});

		r.validate(function(err) {
			expect(err.errors.followedId).to.exist;
			done();
		});
	});

	it('should not be valid if another relationship with the same followerId and followedId combo exists', function() {
		// Need mock db entries.
	});
});

