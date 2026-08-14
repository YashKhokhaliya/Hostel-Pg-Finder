import { Queue } from 'bullmq'
import { bullmqConnection } from '../config/redis.config.js';

const emailQueue = new Queue("email",{
    connection:bullmqConnection
});

export default emailQueue;