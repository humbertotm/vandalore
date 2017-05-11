var chai = require('chai');
var User = require('../../../src/expressAppModules/models/userModel');
var expect = chai.expect;

describe('User model', function() {
    var u;

    beforeEach(function() {
        u = new User();
    });

    afterEach(function() {
        u = {};
    });

    it('should be invalid if no username is present', function(done) {
        u.validate(function(err) {
            expect(err.errors.username).to.exist;
            done();
        });
    });

    it('should be invalid if username is too long', function(done) {
        var name = Array(58).join('a');
        u.username = name;

        u.validate(function(err) {
            expect(err.errors.username).to.exist;
            done();
        });
    });

    // For nested objects, errors produced on nested objects are passed
    // to parent object.
    it('should be invalid if local.email does not match regEx', function(done) {
        u.username = 'some_name';
        u.local.email = 'humberto@humberto@mail.com';

        u.validate(function(err) {
            expect(err).to.not.equal(null);
            done();
        });
    });

    it('should be invalid if no password is present when local email is', function(done) {
        u.username = 'some_name';
        u.local.email = 'humb@mail.com'

        u.validate(function(err) {
            expect(err).to.not.equal(null);
            done();
        });
    });

    it('should be invalid if bio is too long', function(done) {
        u.username = 'some_name';
        u.local.email = 'humb@mail.com'
        u.local.password = 'password';
        u.bio = Array(502).join('a');

        u.validate(function(err) {
            expect(err.errors.bio).to.exist;
            done();
        });
    });

    it('should be valid', function(done) {
        u.username = 'some_name';
        u.local.email = 'humb@mail.com'
        u.local.password = 'password';
        u.bio = 'Some bio';
        u.admin = true;

        u.validate(function(err) {
            expect(err).to.equal(null);
            done();
        });
    })
});