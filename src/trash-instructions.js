const rp = require('request-promise');

const RECOLLECT_URL = 'https://api.recollect.net';
const RECOLLECT_PATH = '/api/areas/recology-1051/services/waste/pages';

const BIN_IMAGES = {
  landfill: 'https://onemedical-ecobot.herokuapp.com/images/black-bin.png',
  recycling: 'https://onemedical-ecobot.herokuapp.com/images/blue-bin.png',
  compost: 'https://onemedical-ecobot.herokuapp.com/images/green-bin.png',
  other: 'https://onemedical-ecobot.herokuapp.com/images/other-bin.png'
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
    const destination = item.sections[4].title.toLowerCase();

    let description, imageUrl;

    if (BIN_IMAGES[destination]) {
      description = toSentenceCase(item.sections[2].rows[0].html);
      imageUrl = BIN_IMAGES[destination];
    } else {
      description = `${item.sections[2].rows[0].html} requires special handling, please visit https://www.recology.com/recology-san-francisco/what-bin/ for more information.`;
      imageUrl = BIN_IMAGES.other;
    }

    // Send back a Slack-formatted block response
    res.send({
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: description,
          },
          accessory: {
            type: 'image',
            image_url: imageUrl,
            alt_text: destination,
          }
        }
      ]
    });
  }).catch(_err => {
    res.send({
      response_type: 'ephemeral',
      'text': "Sorry, Ecobot couldn't process your message right now. Please try again."
    });
  });
}

module.exports = trashInstructions;
