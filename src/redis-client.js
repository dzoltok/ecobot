const redis = require('redis');
const bluebird = require('bluebird');
bluebird.promisifyAll(redis);

const client = redis.createClient(process.env.REDIS_URL);

client.on('connect', () => {
  console.log('Redis client connected');
});

client.on('error', err => {
  console.log(`Error: ${err}`);
});

module.exports = client;
