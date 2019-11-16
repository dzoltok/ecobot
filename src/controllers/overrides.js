import redisClient from '../redis-client.js';

/**
 *
 *
 * @param {Express.Request} req
 * @param {Express.Response} res
 * @returns {Promise<Response | void>}
 */
async function overridesController(req, res) {
  const { itemName, itemTitle, itemDescription, itemBin } = req.body;

  console.info(`Saving item details for ${itemName} to cache`);
  await redisClient.setAsync(
    itemName,
    JSON.stringify({ bin: itemBin, description: itemDescription, title: itemTitle })
  );

  return res.sendStatus(200);
}

export default overridesController;
