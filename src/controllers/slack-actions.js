import rp from 'request-promise';

async function openSubmitCorrectionModal(triggerId) {
  const accessToken = process.env.SLACK_ACCESS_TOKEN;

  rp({
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
              type: 'external_select',
              placeholder: {
                type: 'plain_text',
                text: 'Select the correct bin for this item'
              }
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
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`
    },
    json: true
  });

  return { status: 'ok' };
}

async function dispatchAction(action, payload) {
  if (action === 'submit_correction_modal') {
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
  const payload = req.body.payload;
  const action = payload.actions[0].value;

  return dispatchAction(action, payload)
    .then(data => res.send({ data }))
    .catch(error => res.send({ error }));
}

export default slackActionsController;
