import bodyParser from 'body-parser';
import express from 'express';

import wasteInstructions from './controllers/waste-instructions.js';
import overrides from './controllers/overrides.js';

export const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('public'));
app.set('views', 'src/pages');
app.set('view engine', 'ejs');

app.get('/overrides', (req, res) => res.render('overrides'));
app.post('/overrides', overrides);
app.post('/waste-instructions', wasteInstructions);

export default app;
