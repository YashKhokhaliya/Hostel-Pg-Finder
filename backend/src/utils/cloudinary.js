import {v2 as cloudinary} from "cloudinary"
import fs from "fs"

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;

    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });

    fs.unlinkSync(localFilePath);
    return response;

  } catch (error) {

    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }

    console.error("Cloudinary Upload Error:", error)

    return null;
  }
};

const DeleteOnCloudinary = async function (PublicId){
    try{
        if(!PublicId) return null
        const response = await cloudinary.uploader.destroy(PublicId);
        
        if(response.result==='ok') {
            console.log("Image is removed from cloudinary");
            return true;
        }
        
        console.log("Image is not removed from cloudinary")
        return false;

    }
    catch(error){
        console.log("Image is not found in cloudinary !!!")
        return null
    }
}

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

        if (fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath);
        }

        return response;

    } catch (error) {

        if (localFilePath && fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath);
        }

        console.error(
            "Cloudinary verification document upload error:",
            error
        );

        return null;
    }
};

const generateVerificationDocumentUrl = (
    publicId,
    resourceType
) => {
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
    uploadVerificationDocument
};