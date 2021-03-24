//Importing the application to test
let server = require('../index');

//These are the actual modules we use
let chai = require('chai');
let should = chai.should();
let chaiHttp = require('chai-http');
chai.use(chaiHttp);

let apiUrl = "http://localhost:3000";

describe('Endpoint tests', () => {
    //###########################
    //The beforeEach function makes sure that before each test, 
    //there are exactly two boards and one task (for the first board).
    //###########################
    beforeEach((done) => {
        server.resetState();
        done();
    });

    //###########################
    //Write your tests below here
    //###########################

    it("Get request for all boards - success case", function(done) {
        chai.request(apiUrl)
            .get('/api/v1/boards/')
            .end(function(err, res) {
                res.should.have.status(200);
                res.should.to.be.json;
                res.body.should.be.a('array');
                res.body.should.have.length(2);
                done();
            })
    });

    it("Get request for a specific board - success case", function(done) {
        chai.request(apiUrl)
            .get('/api/v1/boards/0')
            .end(function(err, res) {
                res.should.have.status(200);
                res.should.to.be.json;
                done();
            })
    })

    it('Post request for a board - success case', function(done) {
        let testBoard = {
            name:'TestBoard',
            description:'From the unit testing'
        }
        chai.request(apiUrl)
            .post('/api/v1/boards/')
            .type('json')
            .send(testBoard)
            .end(function(err, res) {
                res.should.have.status(201);
                res.should.to.be.json;
                done();
            })
    })

    // it('Post request for a board - Failing case', function(done) {
    //     let badTestBoard = {
    //         name: 'TestBoard'
    //     }

    //     chai.request(apiUrl)
    //         .post('/api/v1/boards/')
    //         .type('json')
    //         .send(badTestBoard)
    //         .end(function(err, res) {
    //             res.should.have.status(400);
    //             res.should.to.be.json;
    //             done();
    //         })
    // })
    
    it('PUT request for a board (id=1) - success case', function(done) {
        let testBoard = {
            name: 'TestName',
            description: 'Some Description'
        }

        chai.request(apiUrl)
            .put('/api/v1/boards/1')
            .type('json')
            .send(testBoard)
            .end(function(err, res) {
                res.should.have.status(200);
                res.should.to.be.json;
                done();
            })
    })

    it('PUT request for a board (id=1) - Failing case', function(done) {
        let badTestBoard = {
            name: 'TestBoard'
        }

        chai.request(apiUrl)
            .put('/api/v1/boards/1')
            .type('json')
            .send(badTestBoard)
            .end(function(err, res) {
                res.should.have.status(400);
                res.should.to.be.json;
                done();
            })
    })

    it('GET request for the tasks of a specific board (id=0)', function(done) {
        chai.request(apiUrl)
            .get('/api/v1/boards/0/tasks')
            .end(function(err, res) {
                res.should.have.status(200);
                res.should.to.be.json;
                res.body.should.be.a('array');
                done();
            })
    })


    // This test doesn't do much
    it("Please remove me before handin - I don't do much", function (done) {
        chai.request(apiUrl)
            .get('/')
            .end((err, res) => {
                res.should.not.be.undefined;
                done();
            });
    });
});