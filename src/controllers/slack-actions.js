import rp from 'request-promise';

import { Bins } from '../data/bins.js';
import sentenceCase from '../utils/sentence-case.js';
import redisClient from '../redis-client.js';

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
            block_id: 'suggest-block',
            element: {
              type: 'plain_text_input',
              action_id: 'suggest-value'
            },
            label: {
              type: 'plain_text',
              text: 'Search Term',
              emoji: true
            }
          },
          {
            type: 'input',
            block_id: 'bin-block',
            element: {
              action_id: 'bin-value',
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
            block_id: 'title-block',
            element: {
              type: 'plain_text_input',
              action_id: 'title-value'
            },
            label: {
              type: 'plain_text',
              text: 'Title',
              emoji: true
            }
          },
          {
            type: 'input',
            block_id: 'description-block',
            element: {
              type: 'plain_text_input',
              multiline: true,
              action_id: 'description-value'
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

async function handleSubmitCorrectionModal(values) {
  console.log(values);

  const suggest = values['suggest-block']['suggest-value'].value.trim().toLowerCase();
  console.log(`found bin selected option ${values['bin-block']['bin-value'].selected_option}`);
  const bin = values['bin-block']['bin-value'].selected_option.value;
  const title = values['title-block']['title-value'].value.trim();
  const description = values['description-block']['description-value'].value.trim();

  const itemData = {
    bin,
    description,
    title
  };

  console.info(`Saving item details for ${suggest} to cache`);
  await redisClient.setAsync(suggest, JSON.stringify(itemData));

  return { status: 'ok' };
}

async function dispatchViewSubmission(view, payload) {
  if (view === 'submit_correction_modal') {
    console.info(`handling submission of Submit Correction modal`);
    return handleSubmitCorrectionModal(payload.view.state.values);
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

  console.debug(payload);

  if (payload.type === 'block_actions') {
    const action = payload.actions[0].value;

    return dispatchAction(action, payload)
      .then(data => res.send({ data }))
      .catch(error => res.send({ error }));
  } else if (payload.type === 'view_submission') {
    const view = payload.view.callback_id;

    return dispatchViewSubmission(view, payload)
      .then(data => res.send({ data }))
      .catch(error => res.send({ error }));
  }
}

export default slackActionsController;
