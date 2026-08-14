import { createClient } from "redis";
import IORedis from "ioredis"

const redisClient = createClient({
    url: process.env.REDIS_URL
});

const bullmqConnection = new IORedis(process.env.REDIS_URL,{
    maxRetriesPerRequest: null
});

redisClient.on("error", (error) => {
    console.error("Redis Client Error:", error);
});

const connectRedis = async() => {
    try {
        await redisClient.connect()
        console.log('Redis connected successfully')
    } catch (error) {
        console.log('Failed to connect the redis', error)
        process.exit(1)
    }
}
export { redisClient, connectRedis, bullmqConnection };


