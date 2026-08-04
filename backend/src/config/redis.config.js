import { createClient } from "redis";

const redisClient = createClient({
    url: process.env.REDIS_URL
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
export { redisClient, connectRedis };


