var chai = require('chai');
var Post = require('../../../src/expressAppModules/models/postModel');
var expect = chai.expect;

describe('Post model', function() {
    var id;
    var p;

    beforeEach(function() {
        p = new Post();
        id = require('mongoose').Types.ObjectId();
    });

    afterEach(function() {
        p = {};
    });

    it('should be invalid if no userId is present', function(done) {
        p.validate(function(err) {
            expect(err.errors.userId).to.exist;
            done();
        });
    });

    it('should be invalid if no title is present', function(done) {
        p.userId = id;

        p.validate(function(err) {
            expect(err.errors.title).to.exist;
            done();
        });
    });

    it('it should be invalid if title exceeds maxlength', function(done) {
        var titleA = Array(142).join('a');
        p.userId = id;
        p.title = titleA;

        p.validate(function(err) {
            expect(err.errors.title).to.exist;
            done();
        });
    });

    it('should be invalid if description exceeds maxlength', function(done) {
        var descriptionA = Array(1026).join('a');
        p.userId = id;
        p.title = 'Some string.';
        p.description = descriptionA;

        p.validate(function(err) {
            expect(err.errors.description).to.exist;
            done();
        });
    });

    it('should be invalid if image is not present', function(done) {
        p.userId = id;
        p.title = 'Some string.';
        p.description = 'Some description.';

        p.validate(function(err) {
            expect(err.errors.imageUrl).to.exist;
            done();
        });
    });

    it('should be invalid if no category is provided', function(done) {
        p.userId = id;
        p.title = 'Some string.';
        p.description = 'Some description.';
        p.image = '09fa8e6734a7ce';

        p.validate(function(err) {
            expect(err.errors.category).to.exist;
            done();
        });
    });

    it('should be valid', function(done) {
        p.userId = id;
        p.title = 'Some title.';
        p.description = 'Some description.';
        p.imageUrl = 'some-url';
        p.category = 1;

        p.validate(function(err) {
            expect(err).to.equal(null);
            done();
        });
    });

    it('should be valid, too', function(done) {
        p.userId = id;
        p.title = 'Some title.';
        p.imageUrl = 'some-url';
        p.category = 1;

        p.validate(function(err) {
            expect(err).to.equal(null);
            done();
        });
    });
});