import redisClient from '../redis-client.js';
import rp from 'request-promise';
import striptags from 'striptags';

import { binToImage, imageToBin } from '../data/bins.js';
import sentenceCase from '../utils/sentence-case.js';

// Required when fetching single items, as response structure is inconsistent otherwise
const RECOLLECT_API_URI = 'https://api.recollect.net/api/areas/recology-1051/services/waste/pages';
const RECOLLECT_WIDGET_CONFIG = {
  theme: 'recology',
  area: 'recology-1051'
};

/**
 * Return a Slack-friendly object given the information for a particular waste item
 *
 * @see https://api.slack.com/tools/block-kit-builder
 *
 * @param {Object} item A waste item object that responds to title, description, and bin
 * @returns {Object} A set of message blocks interpret-able by slack
 */
function getSlackResponse(item) {
  return {
    blocks: [
      {
        accessory: {
          alt_text: item.bin,
          image_url: `https://onemedical-ecobot.herokuapp.com/images/${binToImage(item.bin)}.png`,
          type: 'image'
        },
        text: {
          text: `*${item.title}*\n${item.description}`.trim(),
          type: 'mrkdwn'
        },
        type: 'section'
      },
      {
        elements: [
          {
            text: 'For more info, visit https://www.recology.com/recology-san-francisco/what-bin/',
            type: 'mrkdwn'
          }
        ],
        type: 'context'
      },
      {
        accessory: {
          text: {
            text: 'Submit a correction',
            type: 'plain_text'
          },
          type: 'button',
          value: 'open_override_modal'
        },
        text: {
          text: '_Is Ecobot wrong?_',
          type: 'mrkdwn'
        },
        type: 'section'
      }
    ],
    response_type: 'in_channel'
  };
}

/**
 * Retrieve the item details for a search term from either memory store or the Recology API
 *
 * @param {string} suggest The search term to look for
 * @returns {Object} A waste item object with bin, title, and description
 */
async function getWasteItemData(suggest) {
  let data;
  const cachedData = await redisClient.getAsync(suggest);

  if (cachedData) {
    data = JSON.parse(cachedData);
  } else {
    console.info(`Querying Recollect for items matching ${suggest}`);
    const results = await rp({
      json: true,
      qs: { suggest },
      uri: `${RECOLLECT_API_URI}`
    });

    const bestResult = results.reduce((prev, current) =>
      parseInt(current.score) > parseInt(prev.score) ? current : prev
    );

    console.info(`Querying Recollect for details of best match "${bestResult.title}"`);
    const item = await rp({
      json: true,
      qs: { widget_config: JSON.stringify(RECOLLECT_WIDGET_CONFIG) },
      uri: `${RECOLLECT_API_URI}/en-US/${bestResult.id}.json`
    });

    const image = item.sections[1].className;
    const bin = imageToBin(image);
    const title = sentenceCase(item.sections[2].rows[0].html);

    let description = '';

    const itemDescriptionRow = item.sections[3].rows.find(row => row.type === 'html');
    if (itemDescriptionRow) {
      description = striptags(itemDescriptionRow.html).trim();
    }

    data = {
      bin,
      description,
      title
    };

    console.info(`Saving item details for ${suggest} to cache`);
    await redisClient.setAsync(suggest, JSON.stringify(data));
  }

  return data;
}

/**
 *
 *
 * @param {Express.Request} req
 * @param {Express.Response} res
 * @returns {Promise<Response | void>}
 */
async function wasteInstructionsController(req, res) {
  const suggest = req.body.text.toLowerCase();

  return getWasteItemData(suggest)
    .then(data => getSlackResponse(data))
    .then(response => res.send(response))
    .catch(err => {
      console.log(err);
      res.send({
        response_type: 'ephemeral',
        text: "Sorry, Ecobot couldn't process your message right now. Please try again."
      });
    });
}

export default wasteInstructionsController;
