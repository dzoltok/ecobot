const rp = require('request-promise');
const striptags = require('striptags');

const RECOLLECT_URL = 'https://api.recollect.net';
const RECOLLECT_PATH = '/api/areas/recology-1051/services/waste/pages';

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
    const itemImage = item.sections[1].className;
    const itemTitle = toSentenceCase(item.sections[2].rows[0].html);

    let itemDescription = '';

    const itemDescriptionRow = item.sections[3].rows.find(row => row.type === 'html');
    if (itemDescriptionRow) {
      itemDescription = striptags(itemDescriptionRow.html).trim();
    }

    // Send back a Slack-formatted block response
    res.send({
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*${itemTitle}*\n${itemDescription}`,
          },
          accessory: {
            type: 'image',
            image_url: `https://onemedical-ecobot.herokuapp.com/images/${itemImage}.png`,
            alt_text: itemImage,
          }
        },
        {
          type: "context",
          elements: [
            {
              type: "mrkdwn",
              text: "For more info, visit https://www.recology.com/recology-san-francisco/what-bin/"
            }
          ]
        }
      ]
    });
  }).catch(_err => {
    res.send({
      response_type: 'ephemeral',
      text: "Sorry, Ecobot couldn't process your message right now. Please try again."
    });
  });
}

module.exports = trashInstructions;
