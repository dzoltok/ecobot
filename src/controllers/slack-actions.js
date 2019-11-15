async function dispatchAction(action, triggerId) {
  console.log(`found action ${action}`);
  console.log(`found trigger ID ${triggerId}`);
  return 'ok';
}

/**
 *
 *
 * @param {Express.Request} req
 * @param {Express.Response} res
 * @returns {Promise<Response | void>}
 */
async function slackActionsController(req, res) {
  console.log(req.body);
  const action = req.body.actions[0].value;
  const triggerId = req.body.trigger_id;

  return dispatchAction(action, triggerId)
    .then(data => res.send({ status: data }))
    .catch(error => res.send({ error: error }));
}

export default slackActionsController;
