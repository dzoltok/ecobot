const express = require('express');
const bodyParser = require('body-parser');
const trashInstructions = require('./trash-instructions');

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('public'));

app.post('/trash-instructions', trashInstructions);

module.exports = app;
