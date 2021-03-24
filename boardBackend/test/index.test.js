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