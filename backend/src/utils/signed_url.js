import { v2 as cloudinary } from "cloudinary";

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


export{
    generateVerificationDocumentUrl
}