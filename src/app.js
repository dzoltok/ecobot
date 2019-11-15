import bodyParser from 'body-parser';
import express from 'express';

import actions from './controllers/slack-actions.js';
import bins from './controllers/bins.js';
import instructions from './controllers/waste-instructions.js';

export const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('public'));

app.post('/actions', actions);
app.post('/bins', bins);
app.post('/instructions', instructions);

export default app;
