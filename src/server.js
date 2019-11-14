const PORT = process.env.PORT || 6500;

const app = require("./app");

const server = app.listen(PORT, error => {
  if (error) {
    return console.error(`Error starting server: ${error}`);
  }
  return console.info(`Express is running on port ${server.address().port}`);
});
