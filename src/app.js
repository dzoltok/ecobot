import bodyParser from 'body-parser';
import express from 'express';
import wasteInstructions from './controllers/waste-instructions.js';

export const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('public'));

app.post('/waste-instructions', wasteInstructions);

export default app;
