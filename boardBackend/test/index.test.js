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
                expect(res).to.have.status(200);
                res.should.to.be.json;
                expect(res.body).to.be.a('Array');
                expect(Object.keys(res.body).length).equal(2);
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
                expect(Object.keys(res.body).length).equal(4);
                expect(res.body).to.have.property("id").to.be.a('String').equal("0");
                expect(res.body).to.have.property("name").to.be.a('String').equal("Planned");
                expect(res.body).to.have.property("description").to.be.a('String').equal("My todo list.");
                expect(res.body).to.have.property("tasks").to.be.a('Array');
                expect(res.body.tasks[0]).to.be.a('String').equal('0');
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
            .set('Content-type', 'application/json')
            .send(testBoard)
            .end(function(err, res) {
                res.should.have.status(201);
                res.should.to.be.json;
                expect(Object.keys(res.body).length).equal(4);
                expect(res.body).to.have.property("id").to.be.a('Number').equal(2);
                expect(res.body).to.have.property("name").to.be.a('String').equal("TestBoard");
                expect(res.body).to.have.property("description").to.be.a('String').equal("From the unit testing");
                expect(res.body).to.have.property("tasks").to.be.a('Array');
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
            .set('Content-type', 'application/json')
            .send(testBoard)
            .end(function(err, res) {
                expect(res).to.have.status(200);
                res.should.to.be.json;
                expect(Object.keys(res.body).length).equal(4);
                expect(res.body).to.have.property("id").to.be.a('String').equal("1");
                expect(res.body).to.have.property("name").to.be.a('String').equal("TestName");
                expect(res.body).to.have.property("description").to.be.a('String').equal("Some Description");
                expect(res.body).to.have.property("tasks").to.be.a('Array');
                expect(res.body.tasks[0]).to.be.a('undefined');
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
            .set('Content-type', 'application/json')
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
                expect(res).to.have.status(200);
                res.should.to.be.json;
                expect(res.body).to.be.a('Array');
                expect(Object.keys(res.body).length).equal(1);
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
                expect(Object.keys(res.body).length).to.be.equal(5);
                expect(res.body).to.have.property("id");
                expect(res.body).to.have.property("boardId").to.be.a('String').equal('0');
                expect(res.body).to.have.property("taskName").to.be.a('String').equal('A task');
                expect(res.body).to.have.property("dateCreated");
                expect(res.body).to.have.property("archived").to.be.a('Boolean');
                done();
            })
    })

    it('POST request for a task', function(done) {
        let newTask = {
            boardId: 0,
            taskName: 'New Task',
            description: 'A new description'
        }
        chai.request(apiUrl)
            .post('/api/v1/boards/0/tasks/')
            .set('Content-type', 'application/json')
            .send(newTask)
            .end(function(err, res) {
                expect(res).to.have.status(201);
                res.should.to.be.json;
                expect(Object.keys(res.body).length).to.be.equal(5);
                expect(res.body).to.have.property("boardId").to.be.a('String').equal("0");
                expect(res.body).to.have.property("taskName").to.be.a('String').equal("New Task");
                expect(res.body).to.have.property("archived").to.be.a('Boolean').equal(false);
                done();
            })
    })

    it('AUTH/DELETE request for a board (boardId = 1)', function(done) {
        let token;
        //TODO post auth
        chai.request(apiUrl)
            .post('/api/v1/auth/')
            .set('Content-type', 'application/json')
            .end(function(err, res) {
                expect(res).to.have.status(200);
                expect(res.body).to.have.property("token");
                token = res.body.token;
            });
        //let request = {}
        console.log(token)

        //TODO delete board

        // chai.request(apiUrl)
        //     .delete('/api/v1/boards/1/')
        //     .end(function(err, res) {
        //         expect(res.body)
        //     });

    })
});