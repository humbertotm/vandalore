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
        var req, res, cat, post1, post2, catMock, id1, id2, id3;
        var sandbox = sinon.sandbox.create();

        beforeEach(function() {
            id1 = mongoose.Types.ObjectId();
            id2 = mongoose.Types.ObjectId();
            id3 = mongoose.Types.ObjectId();

            req = mockHttp.createRequest({

            });

            res = mockHttp.createResponse();

            catMock = sandbox.mock(Category);

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

        it('responds with err when Category.findById() rejects', function(done) {
            var err = {
                errors: {
                    message: 'Some error message.'
                }
            }

            catMock
                .expects('findById')
                .chain('populate')
                .chain('exec')
                .rejects(err);

            catController.get_posts(req, res).then(function() {
                var data = JSON.parse(res._getData());

                catMock.verify();
                expect(res.statusCode).to.equal(500);
                expect(data.errors).to.exist;
                done();
            });
        });
    });

    describe('get_more_posts', function() {
        var req, res, id1, id2, id3, id4, id5,
                cat, post3, post4, catMock, pop, execPop;
        var sandbox = sinon.sandbox.create();

        beforeEach(function() {
            req = mockHttp.createRequest({
                method: 'GET',
                url: '/categories/:categoryId/posts/:postId',
                params: {
                    categoryId: 1,
                    maxId: id3
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
            // pop = sandbox.stub(Category.prototype, 'populate');
            execPop = sandbox.stub(Category.prototype, 'execPopulate');
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

            catController.get_more_posts(req, res).then(function() {
                var data = JSON.parse(res._getData());

                catMock.verify();
                // expect(pop.called).to.equal(true);
                expect(execPop.called).to.equal(true);
                expect(res.statusCode).to.equal(200);
                expect(data.length).to.equal(2);
                done()
            });


        });

        it('responds with err when Category.findById() rejects', function(done) {
            var err = {
                errors: {
                    message: 'Some error message.'
                }
            };

            catMock
                .expects('findById')
                .chain('exec')
                .rejects(err);

            catController.get_more_posts(req, res).then(function() {
                var data = JSON.parse(res._getData());

                catMock.verify();
                expect(res.statusCode).to.equal(500);
                expect(data.errors).to.exist;
                done();
            });
        });

        it('responds with err when doc.execPopulate() rejects', function(done) {
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

            catController.get_more_posts(req, res).then(function() {
                var data = JSON.parse(res._getData());

                catMock.verify();
                expect(execPop.called).to.equal(true);
                expect(res.statusCode).to.equal(500);
                expect(data.errors).to.exist;
                done();
            });
        });
    });
});