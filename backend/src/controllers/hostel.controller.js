import { AsyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js"
import { uploadOnCloudinary, DeleteOnCloudinary } from "../utils/Cloudinary.js";
import { User } from "../models/user.model.js";
import { Hostel } from "../models/hostel.model.js";

const createHostel = AsyncHandler(async(req,res) =>{
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
    if(!parsedLocation?.googleMapLink || !parsedLocation?.address || !parsedLocation?.state || !parsedLocation?.city || !parsedLocation?.area){
        throw new ApiError(400, "All location fields are required")
    }

    if (!Array.isArray(parsedAllowedGenders) || parsedAllowedGenders.length===0) {
        throw new ApiError(
            400,
            "At least one allowed gender is required"
        );
    }

    const validGenders = ["Male", "Female", "Other"];

    const normalizedGenders = parsedAllowedGenders.map((gender) =>{
        return gender.charAt(0).toUpperCase() +
            gender.slice(1).toLowerCase();
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

    parsedLocation.address = parsedLocation.address.trim();
    parsedLocation.googleMapLink = parsedLocation.googleMapLink.trim();
    parsedLocation.state = parsedLocation.state.trim();
    parsedLocation.city = parsedLocation.city.trim();
    parsedLocation.area = parsedLocation.area.trim();

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

    try{
        const hostel = await Hostel.create({
            owner: req.user._id,
            hostelName: hostelName.trim(),
            location: parsedLocation,
            facilities: parsedFacilities,
            allowedGenders: normalizedGenders,
            rent: Number(rent),
            type: normalizedType,
            photos: uploadedPhotos,
        })

        if(!hostel){
            throw new ApiError(500, "Hostel not created")
        }

        return res
        .status(201)
        .json(
            new ApiResponse(201, hostel, "Hostel created successfully")
        )
    }
    catch(error){
        for(const photo of uploadedPhotos){
            try{
                await DeleteOnCloudinary(photo.publicId)
            }
            catch(cleanupError){
                console.log("Failed to cleanup hostel photo:",cleanupError)
            }
        }
        throw new ApiError(
            error.statusCode || 500,
            error.message || "Failed to create Hostel"
        );
    }

})

export {createHostel}
