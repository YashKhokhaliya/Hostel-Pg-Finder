import fs from "fs";
import path from "path";

const tempFolder = path.join(process.cwd(), "public", "temp");

const cleanupTempFiles = async () => {
    try {
        if (!fs.existsSync(tempFolder)) {
            return;
        }

        const files = await fs.promises.readdir(tempFolder);
        const now = Date.now();

        for (const file of files) {
            const filePath = path.join(tempFolder, file);

            const stats = await fs.promises.stat(filePath);

            const fileAge = now - stats.mtimeMs;

            // Delete files older than 2 minutes
            if (fileAge >=  2 * 60 * 1000) {
                await fs.promises.unlink(filePath);
            }
        }
    } catch (error) {
        console.error("Temp cleanup error:", error);
    }
};

const startTempCleanup = () => {
    cleanupTempFiles();

    // Run cleanup every 2 minutes
    setInterval(cleanupTempFiles, 2 * 60 * 1000);

};

export default startTempCleanup;