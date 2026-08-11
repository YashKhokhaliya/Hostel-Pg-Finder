import { AsyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js"
import { uploadOnCloudinary, DeleteOnCloudinary, uploadVerificationDocument, generateVerificationDocumentUrl } from "../utils/Cloudinary.js";
import { User } from "../models/user.model.js";
import { Hostel } from "../models/hostel.model.js";
import { VerifyDocument } from "../models/hostelVerification.model.js";
import deleteLocalFile from "../utils/tempCleanup.js"

const createHostel = AsyncHandler(async(req,res) =>{
    const {verificationId} = req.params

    const verification = await VerifyDocument.findOne({
        _id: verificationId,
        owner: req.user._id,
        status: "Accepted",
        used: false
    }).select("_id")

    if(!verification){
        throw new ApiError(403, "Owner verification is required to create a hostel or this hostel is already created")
    }

    const {hostelName, location, rent, type, facilities, allowedGenders} = req.body

    let parsedLocation;
    let parsedAllowedGenders;
    let parsedFacilities;

    try{
        parsedLocation = JSON.parse(location)

        parsedFacilities = facilities
        ? JSON.parse(facilities)
        : {};

        parsedAllowedGenders = JSON.parse(allowedGenders);

    } catch (error) {
        throw new ApiError(400, "Invalid data format");
    } 


    if(!hostelName?.trim() || !type?.trim() || rent===null || rent===undefined){
        throw new ApiError(400, "These all fields are required")
    }

    if (parsedFacilities === null || Array.isArray(parsedFacilities)) {
        throw new ApiError(400, "Invalid facilities");
    }

    const requiredLocationFields = [
        "googleMapLink",
        "address",
        "state",
        "city",
        "area"
    ]

    const isLocationValid = requiredLocationFields.every(
        (field) => 
            typeof parsedLocation?.[field] === "string" &&
            parsedLocation[field].trim() 
    )

    if(!isLocationValid){
        throw new ApiError(400, "All location fields are required")
    }

    requiredLocationFields.forEach((field)=> {
        parsedLocation[field] = parsedLocation[field].trim()
    })

    if (!Array.isArray(parsedAllowedGenders) || parsedAllowedGenders.length===0) {
        throw new ApiError(
            400,
            "At least one allowed gender is required"
        );
    }

    const areGendersValid = parsedAllowedGenders.every(
        (gender) =>
            typeof gender === "string" &&
            gender.trim() !== ""
    );

    if (!areGendersValid) {
        throw new ApiError(400, "Invalid gender format");
    }

    const validGenders = ["Male", "Female", "Other"];

    const normalizedGenders = parsedAllowedGenders.map((gender) =>{
        const value = gender.trim();

        return value.charAt(0).toUpperCase() +
            value.slice(1).toLowerCase();
    });

    const isValidGender = normalizedGenders.every((gender)=>
        validGenders.includes(gender)
    )

    if(!isValidGender){
        throw new ApiError(400, "Gender is not valid")
    }

    let normalizedType;

    if (type.trim().toLowerCase() === "hostel") {
        normalizedType = "Hostel";
    }
    else if (type.trim().toLowerCase() === "pg") {
        normalizedType = "PG";
    }
    else {
        throw new ApiError(400, "Type is not valid");
    }

    if (Number(rent) < 0 || Number.isNaN(Number(rent))) {
        throw new ApiError(400, "Rent must be a valid non-negative number");
    }

    const validFacilities = ["wifi","ac","laundry","parking","food","hotWater","security"]

    const areFacilitiesValid = Object.entries(parsedFacilities).every(
        ([key, value]) =>
            validFacilities.includes(key) &&
            typeof value === "boolean"
    );

    if (!areFacilitiesValid) {
        throw new ApiError(400, "Invalid facilities");
    }


    const photoLocalPaths = req.files?.map((file) => file.path);
    if(!photoLocalPaths || photoLocalPaths.length < 2 || photoLocalPaths.length > 8){
        throw new ApiError(400, "Hostel photos must be between 2 and 8")
    }

    const uploadedPhotos = [];

    try{
        for(const localPath of photoLocalPaths){
            const photo = await uploadOnCloudinary(localPath)

            if (!photo?.url || !photo?.public_id) {
                throw new Error("Photo upload failed");
            }

            uploadedPhotos.push({
                url: photo.url,
                publicId: photo.public_id
            })
        }
    }   catch(error){
        for(const photo of uploadedPhotos){
            try{
                await DeleteOnCloudinary(photo.publicId)
            }
            catch(cleanupError){
                console.log("Failed to cleanup hostel photo:",cleanupError)
            }
        }

        throw new ApiError(500, "Failed to upload hostel photos")
    }

    let hostel

    try{
        hostel = await Hostel.create({
            owner: req.user._id,
            hostelName: hostelName.trim(),
            location: parsedLocation,
            facilities: parsedFacilities,
            allowedGenders: normalizedGenders,
            rent: Number(rent),
            type: normalizedType,
            photos: uploadedPhotos,
        })

        const hostelResponse = hostel.toObject();
        delete hostelResponse.__v;

        verification.used = true
        await verification.save()

        return res
        .status(201)
        .json(
            new ApiResponse(201, hostelResponse, "Hostel created successfully")
        )
    }
    catch(error){
        if (hostel?._id) {
            try {
                await Hostel.findByIdAndDelete(hostel._id);
            } catch (cleanupError) {
                console.log(
                    "Failed to rollback hostel:",
                    cleanupError
                );
            }
        }

        for(const photo of uploadedPhotos){
            try{
                await DeleteOnCloudinary(photo.publicId)
            }
            catch(cleanupError){
                console.log("Failed to cleanup hostel photo:",cleanupError)
            }
        }

        if (verification.used) {
            try {
                verification.used = false;
                await verification.save();
            } catch (cleanupError) {
                console.log(
                    "Failed to rollback verification:",
                    cleanupError
                );
            }
        }

        throw new ApiError(
            error.statusCode || 500,
            error.message || "Failed to create Hostel"
        );
    }


})

const verifyHostel = AsyncHandler(async(req,res) =>{
    const {city, documentType} = req.body
    const documentLocalPath = req.file?.path

    if(!documentLocalPath){
        throw new ApiError(400, "Please upload verification document")
    }

    if(!city?.trim() || !documentType?.trim()){
        throw new ApiError(400, "City and DocumentType are required")
    }

    if(req.user.role!=='owner'){
        throw new ApiError(403,'Only owners can make request')
    }

    const existingVerification = await VerifyDocument.findOne({
        owner: req.user._id,
        status: "Pending"
    });

    if (existingVerification) {
        throw new ApiError(
            409,
            "Your verification request is already under review"
        );
    }

    const validCity = ["Ahmedabad", "Vadodara", "Surat", "Rajkot"]

    const normalizedCity = validCity.find(
        (item)=> item.toLowerCase() === city.trim().toLowerCase()
    )

    if (!normalizedCity) {
        throw new ApiError(400, "Please select a valid area");
    }

    const validDocument = ['Property document', 'Property tax receipt', 'Lease agreement', 'Owner authorization / NOC']

    const normalizedDocument = validDocument.find(
        (item)=> item.toLowerCase() === documentType.trim().toLowerCase()
    )

    if(!normalizedDocument){
        throw new ApiError(400, "Please select valid document type")
    }

    const document = await uploadOnCloudinary(documentLocalPath)

    if(!document?.secure_url || !document?.public_id || !document?.resource_type){
        throw new ApiError(500, "Error while uploading document")
    }

    let verification
    let result;
    try{
        verification = await VerifyDocument.create({
            owner: req.user._id,
            documentPublicId: document.public_id,
            documentResourceType: document.resource_type,
            city: normalizedCity,
            documentType: normalizedDocument
        })

        result = await VerifyDocument.findById(verification._id).select("-__v -verifiedBy -rejectionReason -documentPublicId")

    } catch(error){
        try {
            await DeleteOnCloudinary(document.public_id);
        } catch (cleanupError) {
            console.error(
                "Failed to delete verification document:",
                cleanupError
            );
        }
        throw error;
    }

    return res
    .status(201)
    .json(
        new ApiResponse(201, result, "Verification request submitted successfully")
    )
})

export {
    createHostel,
    verifyHostel
}
