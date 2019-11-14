// const express = require('express');
// const https = require('https')
const rp = require('request-promise');

const RECOLLECT_URL = 'https://api.recollect.net';
const RECOLLECT_PATH = '/api/areas/recology-1051/services/waste/pages';

const RECOLOGY_IMAGE_URLS = {
  landfill: 'https://recollect-images.global.ssl.fastly.net/api/image/200/recology.blackbin.svg',
  recycling: 'https://recollect-images.global.ssl.fastly.net/api/image/200/recology.bluebin.svg',
  compost: 'https://recollect-images.global.ssl.fastly.net/api/image/200/recology.greenbin.svg',
  other: 'https://recollect-images.global.ssl.fastly.net/api/image/200/recology.otherbin.svg'
}

// Required when fetching single items, as response structure is inconsistent otherwise
const WIDGET_CONFIG = {
  "theme":"recology",
  "area":"recology-1051",
}

function toSentenceCase(str) {
  return str.toLowerCase().replace(/(^\s*\w|[\.\!\?]\s*\w)/g, c => c.toUpperCase());
}

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
      qs: { widget_config: JSON.stringify(WIDGET_CONFIG) },
      uri: `${RECOLLECT_URL}${RECOLLECT_PATH}/en-US/${bestResult.id}.json`,
    });
  }).then(item => {
    const destinationBin = item.sections[4].title.toLowerCase();

    let description, imageUrl;

    if (RECOLOGY_IMAGE_URLS[destinationBin]) {
      description = toSentenceCase(item.sections[2].rows[0].html);
      imageUrl = RECOLOGY_IMAGE_URLS[destinationBin];
    } else {
      description = `${item.sections[2].rows[0].html} has special instructions, please visit https://www.recology.com/recology-san-francisco/what-bin/`;
      imageUrl = RECOLOGY_IMAGE_URLS.other;
    }

    res.send({
      description,
      imageUrl
    });
  });
}

module.exports = trashInstructions;
