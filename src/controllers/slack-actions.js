import rp from 'request-promise';

import { Bins } from '../data/bins.js';
import sentenceCase from '../utils/sentence-case.js';

async function openSubmitCorrectionModal(triggerId) {
  const accessToken = process.env.SLACK_ACCESS_TOKEN;

  const formattedBins = Object.keys(Bins).map(key => {
    return {
      text: {
        text: sentenceCase(Bins[key]),
        type: 'plain_text'
      },
      value: Bins[key]
    };
  });

  const response = await rp({
    method: 'POST',
    uri: 'https://slack.com/api/views.open',
    body: {
      trigger_id: triggerId,
      view: {
        type: 'modal',
        callback_id: 'submit_correction_modal',
        title: {
          type: 'plain_text',
          text: 'Submit a correction'
        },
        submit: {
          type: 'plain_text',
          text: 'Submit',
          emoji: true
        },
        close: {
          type: 'plain_text',
          text: 'Cancel',
          emoji: true
        },
        blocks: [
          {
            type: 'input',
            element: {
              type: 'plain_text_input'
            },
            label: {
              type: 'plain_text',
              text: 'Search Term',
              emoji: true
            }
          },
          {
            type: 'input',
            element: {
              type: 'static_select',
              placeholder: {
                type: 'plain_text',
                text: 'Select the correct bin for this item'
              },
              options: formattedBins
            },
            label: {
              type: 'plain_text',
              text: 'Bin',
              emoji: true
            }
          },
          {
            type: 'input',
            element: {
              type: 'plain_text_input'
            },
            label: {
              type: 'plain_text',
              text: 'Title',
              emoji: true
            }
          },
          {
            type: 'input',
            element: {
              type: 'plain_text_input'
            },
            label: {
              type: 'plain_text',
              text: 'Description',
              emoji: true
            }
          }
        ]
      }
    },
    headers: {
      Authorization: `Bearer ${accessToken}`,
      charset: 'utf-8',
      'Content-Type': 'application/json'
    },
    json: true
  });

  return response;
}

async function dispatchAction(action, payload) {
  if (action === 'submit_correction_modal') {
    console.info(`dispatching action to open the Submit Correction modal with trigger ${payload.trigger_id}`);
    return openSubmitCorrectionModal(payload.trigger_id);
  } else {
    return { status: 'ok' };
  }
}

/**
 *
 *
 * @param {Express.Request} req
 * @param {Express.Response} res
 * @returns {Promise<Response | void>}
 */
async function slackActionsController(req, res) {
  const payload = JSON.parse(req.body.payload);
  const action = payload.actions[0].value;

  return dispatchAction(action, payload)
    .then(data => res.send({ data }))
    .catch(error => res.send({ error }));
}

export default slackActionsController;
