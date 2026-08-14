import { Worker } from "bullmq";
import { DeleteOnCloudinary } from "../utils/Cloudinary.js";
import { bullmqConnection } from "../config/redis.config.js";

const deleteWorker = new Worker(
    'delete',
    async(job)=>{
        await DeleteOnCloudinary(
            job.data.public_id,
            job.data.resource_type,
            job.data.type
        )
    },
    {
        connection:bullmqConnection,
        concurrency:10
    }
)

deleteWorker.on('failed', (job, error) => {
    console.error(
        `Failed to delete Cloudinary photo: ${job?.data?.public_id}`,
        error
    );
});

export default deleteWorker;