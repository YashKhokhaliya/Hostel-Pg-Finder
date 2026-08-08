import crypto from "crypto"
import {redisClient} from "../config/redis.config.js"

const generatePasswordResetToken = async (userId) => {

    const resetToken = crypto.randomBytes(32).toString("hex");

    await redisClient.set(
        `password_reset:${resetToken}`,
        userId.toString(),
        {
            EX: 600
        }
    )

    return resetToken;
};

export {generatePasswordResetToken}