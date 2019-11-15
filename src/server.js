import 'newrelic';

import app from './app.js';

const PORT = process.env.PORT || 6500;

const server = app.listen(PORT, error => {
  if (error) {
    return console.error(`Error starting server: ${error}`);
  }
  return console.info(`Express is running on port ${server.address().port}`);
});
