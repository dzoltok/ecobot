import dotenv from 'dotenv';
dotenv.config({ debug: true });
console.log('process.env', process.env);

import 'newrelic';

import app from './app.js';

const PORT = process.env.PORT;

const server = app.listen(PORT, error => {
  if (error) {
    return console.error(`Error starting server: ${error}`);
  }
  return console.info(`Express is running on port ${server.address().port}`);
});
