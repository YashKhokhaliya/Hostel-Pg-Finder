import { Queue } from "bullmq";
import { bullmqConnection } from "../config/redis.config.js";

const deleteQueue = new Queue('delete',{
    connection:bullmqConnection
})

export default deleteQueue