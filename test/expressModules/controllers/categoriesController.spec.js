// Require controller
var catController    = require('../../../src/expressAppModules/controllers/categoriesController');

// Require models
var Category         = require('../../../src/expressAppModules/models/categoryModel'),
    Post             = require('../../../src/expressAppModules/models/postModel'),
    User             = require('../../../src/expressAppModules/models/userModel');

// Require testing tools
var chai             = require('chai'),
    chaiHttp         = require('chai-http'),
    expect           = chai.expect;
chai.use(chaiHttp);

var mockHttp         = require('node-mocks-http'),
    sinon            = require('sinon'),
    sinonStubPromise = require('sinon-stub-promise');

require('sinon-mongoose');
sinonStubPromise(sinon);

// Require mongoose.
var mongoose         = require('mongoose'),
    Promise          = require('bluebird');
mongoose.Promise     = Promise;

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

            res     = mockHttp.createResponse();
            catMock = sandbox.mock(Category);
            next    = sandbox.spy();

            post1 = new Post();
            post2 = new Post();

            cat = new Category({
                _id: 1,
                posts: [post1, post2]
            });
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
            post1.user = id1;
            post2.user = id2;

            catMock
                .expects('findById')
                .chain('populate')
                .chain('exec')
                .resolves(cat);

            catController.get_posts(req, res, next).then(function() {
                var data = JSON.parse(res._getData());

                catMock.verify();
                expect(res.statusCode).to.equal(200);
                expect(data.entities.posts.length).to.equal(2);
                done();
            });
        });

        it('leaves orphaned posts out', function(done) {
            post1.user = id1;
            post2.user = null;

            catMock
                .expects('findById')
                .chain('populate')
                .chain('exec')
                .resolves(cat);

            catController.get_posts(req, res, next).then(function() {
                var data = JSON.parse(res._getData());

                catMock.verify();
                expect(res.statusCode).to.equal(200);
                expect(data.entities.posts.length).to.equal(1);
                done();
            });
        });

        it('responds with 404 when no category is found', function(done) {
            catMock
                .expects('findById')
                .chain('populate')
                .chain('exec')
                .resolves(null);

            catController.get_posts(req, res, next).then(function() {
                var data = JSON.parse(res._getData());

                catMock.verify();
                expect(res.statusCode).to.equal(404);
                expect(data.message).to.equal('Category not found.');
                done();
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
                .chain('populate')
                .chain('exec')
                .rejects(err);

            catController.get_posts(req, res, next).then(function() {
                catMock.verify();
                expect(next.withArgs(err).called).to.equal(true);
                done();
            });
        });

        it('throws if categoryId is not the correct type', function() {
            var badReq = mockHttp.createRequest({
                params: {
                    categoryId: 'someId'
                }
            });

            expect(function() {
                catController.get_posts(badReq, res, next);
            }).to.throw(Error);
        });
    });

    describe('get_more_posts', function() {
        var req, res, id1, id2, id3, id4, id5, u1, u2,
            next, cat, post3, post4, post5, catMock, pop, execPop;
        var sandbox = sinon.sandbox.create();

        beforeEach(function() {
            id1 = mongoose.Types.ObjectId();
            id2 = mongoose.Types.ObjectId();
            id3 = mongoose.Types.ObjectId();
            id4 = mongoose.Types.ObjectId();
            id5 = mongoose.Types.ObjectId();

            req = mockHttp.createRequest({
                params: {
                    categoryId: '1',
                    maxId: id1.toString()
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
            post5 = new Post();
            u1    = new User();
            u2    = new User();

            catMock = sandbox.mock(Category);
            execPop = sandbox.stub(Category.prototype, 'execPopulate');
            next    = sandbox.spy();
        });

        afterEach(function() {
            sandbox.restore();
            req = {};
            res = {};
            post3 = {};
            post4 = {};
            cat = {};
        });

        it('responds with more posts for specified category', function(done) {
            post3.user = u1;
            post4.user = u2;

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
                expect(data.entities.posts.length).to.equal(2);
                done()
            });
        });

        it('leaves out orphaned posts', function(done) {
            post3.user = u1;
            post4.user = u2;
            post5.user = null;

            var popCat = new Category({
                _id: 1,
                categoryName: 'hot',
                posts: [post3, post4, post5]
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
                expect(data.entities.posts.length).to.equal(2);
                done()
            });
        });

        it('responds with 404 when no category is found', function(done) {
            catMock
                .expects('findById')
                .chain('exec')
                .resolves(null);

            catController.get_posts(req, res, next).then(function() {
                var data = JSON.parse(res._getData());

                catMock.verify();
                expect(res.statusCode).to.equal(404);
                expect(data.message).to.equal('Category not found.');
                done();
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

        it('throws when bad parameters are passed', function() {
            var badReq = mockHttp.createRequest({
                params: {
                    maxId: 'cccc',
                    categoryId: '2'
                }
            });

            expect(function() {
                catController.get_more_posts(badReq, res, next);
            }).to.throw(Error);
        });
    });
});