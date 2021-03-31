//Importing the application to test
let server = require('../index');

//These are the actual modules we use
let chai = require('chai');
let should = chai.should();
let chaiHttp = require('chai-http');
const { assert, expect } = require('chai');
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

    //GET /api/v1/boards
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

    //GET /api/v1/boards/:boardId
    it("Get request for a specific board - success case", function(done) {
        chai.request(apiUrl)
            .get('/api/v1/boards/0')
            .end(function(err, res) {
                expect(res).to.have.status(200);
                res.should.to.be.json;
                //TODO how to check for no extra attibutes
                expect(res.body).to.have.property("id").equal("0");
                expect(res.body).to.have.property("name").equal("Planned");
                expect(res.body).to.have.property("description").equal("My todo list.");
                expect(res.body).to.have.property("tasks");
                //check the task associated w that board
                //TODO this shit doesn't work: (how to check for extra attributes)
                expect(res.body.tasks).to.have.property("id");
                expect(res.body.tasks).to.have.property("boardId");
                expect(res.body.tasks).to.have.property("taskName");
                expect(res.body.tasks).to.have.property("dateCreated");
                expect(res.body.tasks).to.have.property("archived");

                done();
            })
    })

    //POST /api/v1/boards/
    it('POST request for a board - success case', function(done) {
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
                //TODO check for no extra attributes
                //TODO check for correct values
                expect(res.body).to.have.property("id");
                expect(res.body).to.have.property("name");
                expect(res.body).to.have.property("description");
                expect(res.body).to.have.property("tasks");
                done();
            })
    })
    
    //PUT /api/v1/boards/:boardId S
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
                //TODO check no extra attributes
                //TODO check correct values
                expect(res.body).to.have.property("id");
                expect(res.body).to.have.property("name");
                expect(res.body).to.have.property("description");
                expect(res.body).to.have.property("tasks");
                done();
            })
    })

    // PUT /api/v1/boards/:boardId F
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
                expect(res.body).to.have.property("message").equal("To update a board, all attributes are needed (name and description).")
                done();
            })
    })

    //GET /api/v1/boards/:boardId/tasks
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

    //GET /api/v1/boards/:boardId/tasks/:taskId
    it('GET request for a specific task (boardId=0, taskId=0)', function(done) {
        chai.request(apiUrl)
            .get('/api/v1/boards/0/tasks/0')
            .end(function(err, res) {
                res.should.have.status(200);
                res.should.to.be.json;
                //TODO how to check for no extra properties
                //TODO how to check for the right values
                expect(res.body).to.have.property("id");
                expect(res.body).to.have.property("boardId");
                expect(res.body).to.have.property("taskName");
                expect(res.body).to.have.property("dateCreated");
                expect(res.body).to.have.property("archived");
                done();
            })
    })

    


    // // This test doesn't do much
    // it("Please remove me before handin - I don't do much", function (done) {
    //     chai.request(apiUrl)
    //         .get('/')
    //         .end((err, res) => {
    //             res.should.not.be.undefined;
    //             done();
    //         });
    // });
});