var Category = require('../../../src/expressAppModules/models/categoryModel');

var mongoose     = require('mongoose');
var Promise      = require('bluebird');
mongoose.Promise = Promise;

var times = require('async/times');

var fixtures = require('pow-mongoose-fixtures');


var configDB         = require('../../../../DBConfig/dbConfig');

var chai = require('chai');
var expect = chai.expect;

describe.only('Database integration testing', function() {
    beforeEach(function(done) {
        function clearDB() {
            for(var i in mongoose.connection.collections) {
                mongoose.connection.collections[i].remove();
            }
        }

        // Careful with asynchronicity.
        // Thinking about using async.series to execute clearDB() and
        // then load fixtures.
        if(mongoose.connection.readyState === 0) {
            mongoose.connect(configDB.url, function(err) {
                if(err) { throw err; }
                clearDB();
                process.nextTick(function() {
                    fixtures.load(__dirname + '/fixtures/categories.js', mongoose.connection, function(err) {
                        if(err) { throw err; }
                        return done();
                    });
                });
            });
        } else {
            clearDB();
            process.nextTick(function() {
                fixtures.load(__dirname + '/fixtures/categories.js', mongoose.connection, function(err) {
                    if(err) { throw err; }
                    return done();
                });
            });
        }
    });

    afterEach(function(done) {
        mongoose.disconnect(function(err) {
            if(err) { throw err; }
            return done();
        });
    });

    it('tests shit works together', function() {
        var env = process.env.NODE_ENV;
        expect(env).to.equal('test');
    });

    it('tests category count', function(done) {
        Category.count({}, function(err, count) {
            expect(count).to.equal(10);
            done();
        });
    });

    it('tests a hot category exists', function(done) {
        Category.findById(1, function(err, cat) {
            expect(cat.categoryName).to.equal('hot');
            done();
        });
    });

    it.only('creates a new Category', function(done) {
        var cate = new Category({
            _id: 11,
            categoryName: 'tattoo',
            posts: []
        });

        cate.save(function(err, cat) {
            expect(cat._id).to.equal(11);
            done();
        });
    });
});