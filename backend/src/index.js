import dotenv from "dotenv";
import connectDB from "./db/index.js";
import { app } from "./app.js";
import { connectRedis } from "./config/redis.config.js";
import startTempCleanup from "./utils/tempCleanup.js";

import "../src/workers/deleteCloudinary.worker.js"
import "../src/workers/email.worker.js"

dotenv.config({ path: "./.env" });

const startServer = async () => {
    try {
        console.time("SERVER STARTUP");

        await Promise.all([
            connectDB(),
            connectRedis()
        ]);

        app.listen(process.env.PORT, () => {
            console.timeEnd("SERVER STARTUP");
            console.log(`Server is running at port: ${process.env.PORT}`);
        });

    } catch (err) {
        console.error("Server startup failed:", err);
        process.exit(1);
    }
};
startTempCleanup();
startServer();