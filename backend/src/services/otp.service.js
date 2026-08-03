import { redisClient } from "../config/redis.config.js";
import { ApiError } from "./ApiError.js";

const checkOTPCooldown = async(email) => {

    const key = `otp_cooldown:${email}`;
    
    const result = await redisClient.set(
        key,
        "true",
        {
            EX:60,
            NX:true
        }
    );

    if(result===null){
        throw new ApiError(429, 'Please wait before requesting another OTP')
    }
};

const checkOTPGenerationLimit = async(email) => {

    const key = `otp_request:${email}`;

    const count = await redisClient.get(key);

    if(count && Number(count) >= 3) {
        throw new ApiError(
            429,
            "Too many OTP requests. Please try again later."
        );
    }

    const newCount = await redisClient.incr(key);

    // Set expiry only for first request
    if(newCount === 1) {
        await redisClient.expire(
            key,
            3600 // 1 hour
        );
    }
};

const storeOTP = async(email, otp) => {

    try {
        const attempts = await redisClient.get(
            `otp_attempt:${email}`
        );

        if(attempts && Number(attempts) >= 3) {
            throw new ApiError(
                429,
                "Too many failed attempts. Please try again later."
            );
        }

        // set the coolDown to prevent the back to back OTP requests in the 60 seconds
        await checkOTPCooldown(email)

        // if user has already reached the limit of the otp generation then he can't go further
        await checkOTPGenerationLimit(email)
        
        // store the OTP in the redis
        await redisClient.set(
            `otp:${email}`,
            otp,
            {
                EX:120
            }
        );

        

    } catch (error) {
        throw error;
    }
};

const verifyOTP = async(email, otp) => {
    try {
        const storedOTP = await redisClient.get(
            `otp:${email}`
        );

        if(!storedOTP) {
            throw new ApiError(
                400,
                "OTP expired or not found"
            );
        }

        if(storedOTP !== otp) {

            const attemptKey = `otp_attempt:${email}`;

            const attempts = await redisClient.incr(attemptKey);

            if(attempts >= 3) {
                
                // delete the otp and set the timer of 15 minutes to regenerate the OTP
                await redisClient.del(`otp:${email}`);

                await redisClient.expire(
                    attemptKey,
                    900
                );

                throw new ApiError(
                    429,
                    "Too many incorrect OTP attempts. Try again later."
                );
            }

            throw new ApiError(
                400,
                "Invalid OTP"
            );
        }

        await redisClient.del(`otp:${email}`);
        await redisClient.del(`otp_attempt:${email}`);

        return true;

    } catch(error) {
        throw error;
    }
};


export {
    storeOTP,
    verifyOTP,
    checkOTPGenerationLimit
}