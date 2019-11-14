// const express = require('express');
// const https = require('https')
const rp = require('request-promise');

const RECOLLECT_URL = 'https://api.recollect.net'
const RECOLLECT_PATH = '/api/areas/recology-1051/services/waste/pages'

const trashInstructions = (req, res) => {
  const suggest = req.body.text;

  rp({
    json: true,
    qs: { suggest },
    uri: `${RECOLLECT_URL}${RECOLLECT_PATH}`,
  }).then(results => {
    const bestResult = results.reduce((prev, current) => parseInt(current.score) > parseInt(prev.score) ? current : prev);

    return rp({
      json: true,
      uri: `${RECOLLECT_URL}${RECOLLECT_PATH}/en-US/${bestResult.id}.json`,
    });
  }).then(item => {
    console.log(item);

    const instructionSection = item.sections.find(section => section.index === 1);

    const destination = instructionSection.value

    res.send(destination);
  });
}

module.exports = trashInstructions;
