import { Bins } from '../data/bins.js';
import sentenceCase from '../utils/sentence-case.js';

function formatBins(bins) {
  return Object.keys(bins).map(key => {
    return {
      text: {
        text: sentenceCase(bins[key]),
        type: 'plain_text'
      },
      value: bins[key]
    };
  });
}

/**
 *
 *
 * @param {Express.Request} req
 * @param {Express.Response} res
 * @returns {Promise<Response | void>}
 */
async function binsController(_req, res) {
  return res.send({
    options: formatBins(Bins)
  });
}

export default binsController;
