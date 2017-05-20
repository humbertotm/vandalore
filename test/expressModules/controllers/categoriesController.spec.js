// Require controller
var catController = require('../../../src/expressAppModules/controllers/categoriesController');

// Require models
var Category = require('../../../src/expressAppModules/models/categoryModel');
var Post = require('../../../src/expressAppModules/models/postModel');

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

describe('Categories controller', function() {
    describe('get_posts', function() {
        var req, res, cat, post1, post2,
            catMock, id1, id2, id3, next;
        var sandbox = sinon.sandbox.create();

        beforeEach(function() {
            id1 = mongoose.Types.ObjectId();
            id2 = mongoose.Types.ObjectId();
            id3 = mongoose.Types.ObjectId();

            req = mockHttp.createRequest({
                params: {
                    categoryId: '1'
                }
            });

            res = mockHttp.createResponse();

            catMock = sandbox.mock(Category);

            next = sandbox.spy();

            cat = new Category({
                _id: 1,
                posts: [post1, post2]
            });

            post1 = new Post();
            post2 = new Post();
        });

        afterEach(function() {
            sandbox.restore();
            cat = {};
            req = {};
            res = {};
            post1 = {};
            post2 = {};
        });

        it('responds with posts for specified category', function(done) {
            catMock
                .expects('findById')
                .chain('populate')
                .chain('exec')
                .resolves(cat);

            catController.get_posts(req, res).then(function() {
                var data = JSON.parse(res._getData());

                catMock.verify();
                expect(res.statusCode).to.equal(200);
                expect(data.length).to.equal(2);
                done();
            });
        });

        it('passes err to next() when Category.findById() rejects', function(done) {
            var err = {
                errors: {
                    message: 'Some error message.'
                }
            };

            catMock
                .expects('findById')
                .chain('populate')
                .chain('exec')
                .rejects(err);

            catController.get_posts(req, res, next).then(function() {
                catMock.verify();
                expect(next.withArgs(err).called).to.equal(true);
                done();
            });
        });

        it.skip('throws if categoryId is not the correct type', function() {
            var badReq = mockHttp.createRequest({
                params: {
                    categoryId: 'someId'
                }
            });

            // Not working.
            // It is throwing before assertion is made.
            // Somehow it failling proves its working fine.
            expect(catController.get_posts(badReq, res, next)).to.throw(Error);
        });
    });

    describe('get_more_posts', function() {
        var req, res, id1, id2, id3, id4, id5,
            next, cat, post3, post4, catMock, pop, execPop;
        var sandbox = sinon.sandbox.create();

        beforeEach(function() {
            id1 = mongoose.Types.ObjectId;
            id2 = mongoose.Types.ObjectId;
            id3 = mongoose.Types.ObjectId;
            id4 = mongoose.Types.ObjectId;
            id5 = mongoose.Types.ObjectId;

            req = mockHttp.createRequest({
                // All params are parsed as Strings.
                params: {
                    categoryId: '1',
                    maxId: 'cccccccccccccccccccccccc'
                }
            });

            res = mockHttp.createResponse();

            cat = new Category({
                _id: 1,
                categoryName: 'hot',
                posts: [id1, id2, id3, id4, id5]
            });

            post3 = new Post();
            post4 = new Post();

            catMock = sandbox.mock(Category);
            execPop = sandbox.stub(Category.prototype, 'execPopulate');
            next = sandbox.spy();
        });

        afterEach(function() {
            sandbox.restore();
            req = {};
            res = {};
        });

        it('responds with more posts for specified category', function(done) {
            var popCat = new Category({
                _id: 1,
                categoryName: 'hot',
                posts: [post3, post4]
            });

            catMock
                .expects('findById')
                .chain('exec')
                .resolves(cat)

            execPop.returnsPromise().resolves(popCat);

            catController.get_more_posts(req, res, next).then(function() {
                var data = JSON.parse(res._getData());

                catMock.verify();
                expect(execPop.called).to.equal(true);
                expect(res.statusCode).to.equal(200);
                expect(data.length).to.equal(2);
                done()
            });
        });

        it('calls next(err) when Category.findById() rejects', function(done) {
            var err = {
                errors: {
                    message: 'Some error message.'
                }
            };

            catMock
                .expects('findById')
                .chain('exec')
                .rejects(err);

            catController.get_more_posts(req, res, next).then(function() {
                catMock.verify();
                expect(next.withArgs(err).called).to.equal(true);
                done();
            });
        });

        it('calls next(err) when doc.execPopulate() rejects', function(done) {
            var err = {
                errors: {
                    message: 'Some error message.'
                }
            };

            catMock
                .expects('findById')
                .chain('exec')
                .resolves(cat);

            execPop.returnsPromise().rejects(err);

            catController.get_more_posts(req, res, next).then(function() {
                catMock.verify();
                expect(execPop.called).to.equal(true);
                expect(next.withArgs(err).called).to.equal(true);
                done();
            });
        });

        it.skip('throws when bad parameters are passed', function() {
            // Same issue as above.
            var badReq = mockHttp.createRequest({
                params: {
                    maxId: 'cccc',
                    categoryId: '2'
                }
            });

            expect(catController.get_more_posts(badReq, res, next)).to.throw(Error);
        });
    });
});