import bluebird from 'bluebird';
import redis from 'redis';

bluebird.promisifyAll(redis);

console.log('REDIS_URL', process.env.REDIS_URL);
const client = redis.createClient(process.env.REDIS_URL);

client.on('connect', () => {
  console.log('Redis client connected');
});

client.on('error', err => {
  console.log(`Error: ${err}`);
});

export default client;
