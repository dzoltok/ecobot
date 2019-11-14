// const express = require('express');

const trashInstructions = (req, res) => {
  console.info(`processing request for trash instructions`);
  res.send({status: 'ok'});
  // Parse the req to figure out the search text

  // Query the Recology/Recollect API to get the item ID

  // Query the API by item ID to get the full payload

  //
}

module.exports = trashInstructions;
