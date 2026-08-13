import {v2 as cloudinary} from "cloudinary"
import fs from "fs"

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})

const uploadOnCloudinary = async (localFilePath) => {
    // console.log("TEMP FILE:", localFilePath);
//     console.log("EXISTS BEFORE:", fs.existsSync(localFilePath));

// fs.unlinkSync(localFilePath);

// console.log("EXISTS AFTER:", fs.existsSync(localFilePath));
    try {
        if (!localFilePath) return null;

        console.log("TEMP FILE:", localFilePath);

        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto",
        });

        fs.unlinkSync(localFilePath);
        return response;

    } catch (error) {
        console.log("EXISTS BEFORE:", fs.existsSync(localFilePath));
        if (fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath);
        }
        console.log("EXISTS AFTER:", fs.existsSync(localFilePath));
        console.error("Cloudinary Upload Error:", error)

        return null;
    }
};

const DeleteOnCloudinary = async function ( publicId, resourceType, type ) {
    try {
        if (!publicId) return null;

        const response = await cloudinary.uploader.destroy(publicId, {
            resource_type: resourceType,
            type: type
        });

        if (response.result === "ok") {
            console.log("Asset removed from Cloudinary");
            return true;
        }

        console.log("Asset was not removed from Cloudinary");
        return false;

    } catch (error) {
        console.error("Cloudinary deletion error:", error);
        return null;
    }
};

const uploadVerificationDocument = async (localFilePath) => {
    try {
        if (!localFilePath) return null;

        const response = await cloudinary.uploader.upload(
            localFilePath,
            {
                resource_type: "auto",
                type: "authenticated",
                folder: "verification-documents"
            }
        );

        fs.unlinkSync(localFilePath);

        return response;

    } catch (error) {
        if (fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath);
        }
        console.error(
            "Cloudinary verification document upload error:",
            error
        );

        return null;
    }
};

const generateVerificationDocumentUrl = ( publicId,resourceType) => {
    return cloudinary.url(publicId, {
        resource_type: resourceType,
        type: "authenticated",
        secure: true,
        sign_url: true
    });
};

export {
    uploadOnCloudinary,
    DeleteOnCloudinary,
    uploadVerificationDocument,
    generateVerificationDocumentUrl
};