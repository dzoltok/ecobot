import bodyParser from 'body-parser';
import express from 'express';

import bins from './controllers/bins.js';
import actions from './controllers/slack-actions.js';
import instructions from './controllers/waste-instructions.js';

export const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('public'));

app.post('/bins', bins);
app.post('/actions', actions);
app.post('/instructions', instructions);

export default app;
