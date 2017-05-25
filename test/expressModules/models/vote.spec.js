/*
var chai = require('chai');
var Vote = require('../../../src/expressAppModules/models/voteModel');
var expect = chai.expect;

describe('Vote model', function() {
    var id;

    beforeEach(function() {
        id = require('mongoose').Types.ObjectId();
    });

    it('should be valid if userId is present', function(done) {
        var vote = new Vote({ userId: id, postId: id });
        vote.validate(function(err) {
            expect(err).to.equal(null);
            done();
        });
    });

    it('should not be valid if userId is not present', function(done) {
        var vote = new Vote({ postId: id });
        vote.validate(function(err) {
            expect(err.errors.userId).to.exist;
            done();
        });
    });

    it('should not be valid if postId is not present', function(done) {
        var vote = new Vote({ userId: id });
        vote.validate(function(err) {
            expect(err.errors.postId).to.exist;
            done();
        });
    });

    it('should not be valid if another vote with same combination of userId and postId exists', function() {
        // Need to find a way to mock database and docs
        // in collection to compare and test.
    });
});
*/