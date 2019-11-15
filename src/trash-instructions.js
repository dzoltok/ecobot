const redisClient = require('./redis-client');
const rp = require('request-promise');
const striptags = require('striptags');

const RECOLLECT_API_URI = 'https://api.recollect.net/api/areas/recology-1051/services/waste/pages';

// Required when fetching single items, as response structure is inconsistent otherwise
const WIDGET_CONFIG = {
  "theme":"recology",
  "area":"recology-1051",
}

/**
 *
 *
 * @param {string} str
 * @returns {string}
 */
function toSentenceCase(str) {
  return str.toLowerCase().replace(/(^\s*\w|[.!?]\s*\w)/g, c => c.toUpperCase());
}

/**
 *
 *
 * @param {string} title
 * @param {string} description
 * @param {string} image
 * @returns {Object}
 */
function formatSlackResponse(title, description, image) {
  return {
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*${title}*\n${description}`,
        },
        accessory: {
          type: 'image',
          image_url: `https://onemedical-ecobot.herokuapp.com/images/${image}.png`,
          alt_text: image,
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
  };
}

/**
 *
 *
 * @param {string} searchTerm
 * @returns {Promise<Object>}
 */
async function buildSlackResponse(searchTerm) {
  let slackResponse;

  const reply = await redisClient.getAsync(searchTerm);

  if (reply) {
    // A cached Slack message for this search term exists
    console.info(`Retrieving Slack response for ${searchTerm} from cache`);
    slackResponse = JSON.parse(reply);
  } else {
    console.info(`Querying Recollect for items matching ${searchTerm}`);
    const results = await rp({
      json: true,
      qs: { suggest: searchTerm },
      uri: `${RECOLLECT_API_URI}`,
    });

    const bestResult = results.reduce((prev, current) => parseInt(current.score) > parseInt(prev.score) ? current : prev);

    console.info(`Querying Recollect for details of best match "${bestResult.title}"`);
    const item = await rp({
      json: true,
      qs: { widget_config: JSON.stringify(WIDGET_CONFIG) },
      uri: `${RECOLLECT_API_URI}/en-US/${bestResult.id}.json`,
    });

    const itemImage = item.sections[1].className;
    const itemTitle = toSentenceCase(item.sections[2].rows[0].html);

    let itemDescription = '';

    const itemDescriptionRow = item.sections[3].rows.find(row => row.type === 'html');
    if (itemDescriptionRow) {
      itemDescription = striptags(itemDescriptionRow.html).trim();
    }

    slackResponse = formatSlackResponse(itemTitle, itemDescription, itemImage);
    console.info(`Saving Slack response for ${searchTerm} to cache`);
    await redisClient.setAsync(searchTerm, JSON.stringify(slackResponse));
  }
  return slackResponse;
}

/**
 *
 *
 * @param {Express.Request} req
 * @param {Express.Response} res
 * @returns {Promise<Response | void>}
 */
async function trashInstructionsController(req, res) {
  const suggest = req.body.text.toLowerCase();

  return buildSlackResponse(suggest)
    .then(response => res.send(response))
    .catch(err => {
      console.log(err);
      res.send({
        response_type: 'ephemeral',
        text: "Sorry, Ecobot couldn't process your message right now. Please try again."
      })
    });
}

module.exports = trashInstructionsController;
