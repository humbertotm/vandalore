var chai = require('chai');
var Category = require('../../../src/expressAppModules/models/categoryModel');
var expect = chai.expect;

describe('Category model', function() {
    var id;
    var id1;
    var c;

    beforeEach(function() {
        id = require('mongoose').Types.ObjectId();
        id1 = require('mongoose').Types.ObjectId();
        c = new Category();
    });

    afterEach(function() {
        c = {};
    });

    it('should be invalid if _id is not a Number', function(done) {
        c._id = id;

        c.validate(function(err) {
            expect(err.errors._id).to.exist;
            done();
        });
    });

    it('should be invalid if no cateogry name is assigned', function(done) {
        c._id = 1;

        c.validate(function(err) {
            expect(err.errors.categoryName).to.exist;
            done();
        });
    });

    it('should be invalid if a categoryName is not within the predefined categories', function(done) {
        c._id = 1;
        c.categoryName = 'somecategory';

        c.validate(function(err) {
            expect(err.errors.categoryName).to.exist;
            done();
        });
    });

    it('should be valid', function(done) {
        c._id = 1;
        c.categoryName = 'tattoo';

        c.validate(function(err) {
            expect(err).to.equal(null);
            done();
        });
    });

    it('should be valid, too', function(done) {
        c._id = 1;
        c.categoryName = 'tattoo';
        c.posts = [id, id1];

        c.validate(function(err) {
            expect(err).to.equal(null);
            done();
        });
    });
});