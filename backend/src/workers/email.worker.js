import { Worker } from "bullmq";

import {
    sendOTPEmail,
    sendStudentWelcomeEmail,
    sendOwnerWelcomeEmail,
    sendAdminWelcomeEmail,
    sendPasswordResetOTPEmail,
    sendVerificationRejectedEmail,
    sendVerificationAcceptedEmail
} from "../services/mail.service.js"

import { bullmqConnection } from "../config/redis.config.js";

const emailWorker = new Worker(
    'email',
    async(job)=>{
        switch(job.name){

            case "welcome-student":
                await sendStudentWelcomeEmail(
                    job.data.email,
                    job.data.username,
                )
                break;
            
            case "welcome-admin":
                await sendAdminWelcomeEmail(
                    job.data.email,
                    job.data.username,
                )
                break

            case "welcome-owner":
                await sendOwnerWelcomeEmail(
                    job.data.email,
                    job.data.username,
                )
                break
            
            case "send-otp":
                await sendOTPEmail(
                    job.data.email,
                    job.data.otp
                )
                break

            case "send-password-reset-otp":
                await sendPasswordResetOTPEmail(
                    job.data.email,
                    job.data.otp
                )
                break

            case "verification-accepted":
                await sendVerificationAcceptedEmail(
                    job.data.email,
                    job.data.username
                )
                break

            case "verification-rejected":
                await sendVerificationRejectedEmail(
                    job.data.email,
                    job.data.username,
                    job.data.reason
                )
                break

            default:
                throw new Error(`Unknown email job: ${job.name}`);
        }
    },
    {
        connection:bullmqConnection,
        concurrency:10
    }
)

export default emailWorker