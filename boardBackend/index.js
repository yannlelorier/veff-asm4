const express = require('express');

//Import a body parser module to be able to access the request body as json
const bodyParser = require('body-parser');

const cors = require('cors');

const app = express();
const apiPath = '/api/';
const version = 'v1';
var port = process.env.PORT || 3000;

//Added to support authentication and SHA256 hashing
const basicAuth = require('express-basic-auth');
const sha256 = require('js-sha256');

//Authentication function. We'll be using this in the auth endpoint to obtain a token
function checkCredentials(username, pw) {
    if (username == "admin" && sha256(pw) == "2bb80d537b1da3e38bd30361aa855686bde0eacd7162fef6a25fe97bf527a25b") {
        return true;
    } else {
        return false;
    }
}

//Tell express to use the body parser module
app.use(bodyParser.json());

//Tell express to use cors -- enables CORS for this backend
app.use(cors());

//Our id counters
let nextBoardId = 0;
let nextTaskId = 0;

let validTokens = [];

let boards =  [
    { id: '0', name: "Planned", description: "My todo list.", tasks: new Map() },
    { id: '1', name: "Ongoing", description: "Currently in progress.", tasks: new Map() }
];

boards[0].tasks.set('0', { id: '0', boardId: '0', taskName: "A task", dateCreated: new Date(Date.UTC(2021, 00, 21, 15, 48)), archived: false });


module.exports.resetState = function () {
    boards = [
        { id: '0', name: "Planned", description: "My todo list.", tasks: new Map() },
        { id: '1', name: "Ongoing", description: "Currently in progress.", tasks: new Map() }
    ];

    boards[0].tasks.set('0', { id: '0', boardId: '0', taskName: "A task", dateCreated: new Date(Date.UTC(2021, 00, 21, 15, 48)), archived: false });

    nextBoardId = 2;
    nextTaskId = 1;

    validTokens = [];
};

//Checks HTTP basic auth and returns a token if valid
app.post(apiPath + version + '/auth', basicAuth({ authorizer: checkCredentials }), (req, res) => {
    //Note: If you are ever to implement your own token-based authorisation, do not use this code!
    //It's made to be as simple as possible, but is definitely not secure.
    let newToken = sha256("theseTokensAreNotSecure" + Math.random());
    validTokens.push(newToken);
    return res.status(200).json({ "token": validTokens });
});

//Board endpoints
app.get(apiPath + version + '/boards', (req, res) => {
    let boardArray = [];
    for (let i = 0; i < boards.length; i++) {
        boardArray.push({ id: boards[i].id, name: boards[i].name, description: boards[i].description });
    }

    res.status(200).json(boardArray);
});

app.get(apiPath + version + '/boards/:boardId', (req, res) => {
    for (let i = 0; i < boards.length; i++) {
        if (boards[i].id == req.params.boardId) {
            let returnBoard = { id: boards[i].id, name: boards[i].name, description: boards[i].description, tasks: Array.from(boards[i].tasks.keys()) };
            return res.status(200).json(returnBoard);
        }
    }
    res.status(404).json({ 'message': "Board with id " + req.params.boardId + " does not exist." });
});

app.post(apiPath + version + '/boards', (req, res) => {
    if (req.body === undefined || req.body.name === undefined || req.body.name === "" || req.body.description === undefined) {
        return res.status(400).json({ 'message': "Boards require at least a name, and description." });
    } else {
        let newBoard = { id: nextBoardId, name: req.body.name, description: req.body.description, tasks: new Map() };
        boards.push(newBoard);
        nextBoardId++;
        let returnBoard = { id: newBoard.id, name: newBoard.name, description: newBoard.description, tasks: [] };
        res.status(201).json(returnBoard);
    }
});

app.put(apiPath + version + '/boards/:boardId', (req, res) => {
    if (req.body === undefined || req.body.name === undefined || req.body.description === undefined) {
        return res.status(400).json({ 'message': "To update a board, all attributes are needed (name and description)." });
    } else {

        for (let i = 0; i < boards.length; i++) {
            if (boards[i].id == req.params.boardId) {
                //Check if there are unarchived tasks left in the board --> decline modification
                if (boards[i].tasks.size > 0) {
                    for (let [key, value] of boards[i].tasks) {
                        if (value.archived === false) {
                            return res.status(400).json({ 'message': "Cannot modify boards with non-archived tasks. Delete/archive/move the tasks first." });
                        }
                    }
                }

                boards[i].name = req.body.name;
                boards[i].description = req.body.description;
                let returnBoard = { id: boards[i].id, name: boards[i].name, description: boards[i].description, tasks: Array.from(boards[i].tasks.keys()) };
                return res.status(200).json(returnBoard);
            }
        }

        res.status(404).json({ 'message': "Board with id " + req.params.boardId + " does not exist." });
    }
});

app.delete(apiPath + version + '/boards/:boardId', (req, res) => {
    //Check validity of token
    if (req.header("Authorization") === undefined) {
        return res.status(401).json({ 'message': "Unauthorized." });
    } else {
        let authMethod = req.header("Authorization").substring(0, 6);
        let token = req.header("Authorization").substring(7);
        if (authMethod !== "Bearer") {
            return res.status(401).json({ 'message': "Unauthorized." });
        } else {
            let isValid = false;
            for (let i = 0; i < validTokens.length; i++) {
                if (validTokens[i] === token) {
                    isValid = true;
                    break;
                }
            }

            if (isValid === false) {
                return res.status(401).json({ 'message': "Unauthorized." });
            }
        }
    }

    //Perform actual delete request
    for (let i = 0; i < boards.length; i++) {
        if (boards[i].id == req.params.boardId) {
            //Check if there are unarchived tasks left in the board --> decline modification
            if (boards[i].tasks.size > 0) {
                for (let [key, value] of boards[i].tasks) {
                    if (value.archived === false) {
                        return res.status(400).json({ 'message': "Cannot delete boards with non-archived tasks. Delete/archive/move the tasks first." });
                    }
                }
            }
            let returnBoard = boards.splice(i, 1);

            if (returnBoard.tasks !== undefined) {
                returnBoard.tasks = Array.from(returnBoard.tasks.keys());
            } else {
                returnBoard.tasks = [];
            }
            return res.status(200).json(returnBoard);
        }
    }
    res.status(404).json({ 'message': "Board with id " + req.params.boardId + " does not exist." });
});

//Tasks endpoints
app.get(apiPath + version + '/boards/:boardId/tasks', (req, res) => {
    for (let i = 0; i < boards.length; i++) {
        if (boards[i].id == req.params.boardId) {
            let returnArray = Array.from(boards[i].tasks.values());
            return res.status(200).json(returnArray);
        }
    }

    res.status(404).json({ 'message': "Board with id " + req.params.boardId + " does not exist." });
});

app.get(apiPath + version + '/boards/:boardId/tasks/:taskId', (req, res) => {
    for (let i = 0; i < boards.length; i++) {
        if (boards[i].id == req.params.boardId) {
            if (!boards[i].tasks.has(String(req.params.taskId))) {
                return res.status(404).json({ 'message': "Task with id " + req.params.taskId + " does not exist for the selected board." });
            } else {
                let returnTask = boards[i].tasks.get(String(req.params.taskId));
                returnTask.dateCreated = returnTask.dateCreated.getTime();
                return res.status(200).json(returnTask);
            }
        }
    }
    res.status(404).json({ 'message': "Board with id " + req.params.boardId + " does not exist." });
});

app.post(apiPath + version + '/boards/:boardId/tasks', (req, res) => {
    if (req.body === undefined || req.body.taskName === undefined) {
        return res.status(400).json({ 'message': "Tasks require a taskName in the request body." });
    } else {
        for (let i = 0; i < boards.length; i++) {
            if (boards[i].id == req.params.boardId) {

                let newTask = {
                    id: String(nextTaskId), taskName: req.body.taskName, boardId: req.params.boardId, dateCreated: Date.now(), archived: false
                };

                boards[i].tasks.set(String(nextTaskId), newTask);
                nextTaskId++;
                res.status(201).json(newTask);
                return;
            }
        }
        res.status(404).json({ 'message': "Board with id " + req.params.boardId + " does not exist" });
    }
});

//Default: Not supported
app.use('*', (req, res) => {
    res.status(405).send('Operation not supported.');
});

app.listen(port, () => {
    console.log('Event app listening...');
});