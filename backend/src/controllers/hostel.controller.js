import { AsyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js"
import { uploadOnCloudinary, DeleteOnCloudinary, uploadVerificationDocument, generateVerificationDocumentUrl } from "../utils/Cloudinary.js";
import { User } from "../models/user.model.js";
import { Hostel } from "../models/hostel.model.js";
import { VerifyDocument } from "../models/hostelVerification.model.js";
import mongoose, { isValidObjectId } from "mongoose";
import { response } from "express";

const createHostel = AsyncHandler(async(req,res) =>{
    const {verificationId} = req.params

    if (!mongoose.isValidObjectId(verificationId)) {
        throw new ApiError(400, "Invalid verification Id");
    }
    const verification = await VerifyDocument.findOne({
        _id: verificationId,
        owner: req.user._id,
        status: "accepted",
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

    const validGenders = ["male", "female", "other"];

    const isValidGender = parsedAllowedGenders.every((gender)=>
        validGenders.includes(gender.trim().toLowerCase())
    )

    if(!isValidGender){
        throw new ApiError(400, "Gender is not valid")
    }

    const normalizedGenders = parsedAllowedGenders.map(
        (gender) => gender.trim().toLowerCase()
    );

    let normalizedType;

    if (type.trim().toLowerCase() === "hostel") {
        normalizedType = "hostel";
    }
    else if (type.trim().toLowerCase() === "pg") {
        normalizedType = "pg";
    }
    else {
        throw new ApiError(400, "Type is not valid");
    }

    if ( String(rent).trim() === "" || Number(rent) < 0 || Number.isNaN(Number(rent))) {
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
                public_id: photo.public_id,
                resourceType:photo.resource_type,
                type:photo.type
            })
        }
    }   catch(error){
        for(const photo of uploadedPhotos){
            try{
                await DeleteOnCloudinary(photo.public_id, photo.resourceType, photo.type)
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
            verificationId:verificationId
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
                await DeleteOnCloudinary(photo.public_id, photo.resourceType, photo.type)
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
        status: "pending"
    });

    if (existingVerification) {
        throw new ApiError(
            409,
            "Your verification request is already under review"
        );
    }

    const validCity = ["ahmedabad", "vadodara", "surat", "rajkot"]

    const normalizedCity = validCity.find(
        (item)=> item === city.trim().toLowerCase()
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

    const document = await uploadVerificationDocument(documentLocalPath)

    if(!document?.secure_url || !document?.public_id || !document?.resource_type){
        throw new ApiError(500, "Error while uploading document")
    }

    let verification
    let result;
    try{
        verification = await VerifyDocument.create({
            owner: req.user._id,
            document:{
                url:document.secure_url,
                public_id:document.public_id,
                resourceType:document.resource_type,
                type:document.type
            },
            city: normalizedCity.toLocaleLowerCase(),
            documentType: normalizedDocument
        })

        result = await VerifyDocument.findById(verification._id).select("-__v -verifiedBy -rejectionReason")

    } catch(error){
        try {
            await DeleteOnCloudinary(document.public_id, document.resource_type, document.type);
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

const getHostelById = AsyncHandler(async(req,res)=>{
    const {hostelId} = req.params

    if(!mongoose.isValidObjectId(hostelId)){
        throw new ApiError(400, "Invalid Hostel Id")
    }

    const hostel = await Hostel.findById(hostelId)
    .populate("owner", "fullname profilePhoto")
    .select("-__v  -photos.public_id")

    if(!hostel){
        throw new ApiError(404, "Hostel Not Found")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, hostel, "Hostel fetched successfully")
    )
})

const getAllHostel = AsyncHandler(async(req, res)=>{
    let { minRange, maxRange, type, gender, state, city } = req.query;

    // check :- parse the array from json string array to original array
    if (type !== undefined && !Array.isArray(type)) {
        type = [type];
    }

    if (gender !== undefined && !Array.isArray(gender)) {
        gender = [gender];
    }

    if (type) {
        if (type.length === 0) {
            throw new ApiError(400, "Type cannot be empty");
        }

        if (!type.every(t => typeof t === "string")) {
            throw new ApiError(400, "Invalid type format");
        }

        type.forEach((t,i)=>{
            type[i]=t.trim().toLowerCase();
        })

        if (
            type.some(t => t === "") ||
            !type.every(t => ["pg", "hostel"].includes(t))
        ) {
            throw new ApiError(400, "Invalid type");
        }
    }

    if (gender) {
        if (gender.length === 0) {
            throw new ApiError(400, "Gender cannot be empty");
        }

        if (!gender.every(g => typeof g === "string")) {
            throw new ApiError(400, "Invalid gender format");
        }

        gender.forEach((g,i)=>{
            gender[i]=g.trim().toLowerCase();
        })

        if (
            gender.some(g => g === "") ||
            !gender.every(g =>
                ["male", "female", "other"].includes(g)
            )
        ) {
            throw new ApiError(400, "Invalid gender");
        }
    }

    if (state !== undefined) {
        if (typeof state !== "string" || state.trim() === "") {
            throw new ApiError(400, "Invalid state");
        }

        state = state.trim().toLowerCase();
    }

    if (city !== undefined) {
        if (typeof city !== "string" || city.trim() === "") {
            throw new ApiError(400, "Invalid city");
        }

        city = city.trim().toLowerCase();
    }

    let min = null;
    let max = null;

    if (minRange !== undefined) {
        min = Number(minRange);

        if (!Number.isFinite(min) || min < 0) {
            throw new ApiError(400, "Invalid minimum range");
        }
    }

    if (maxRange !== undefined) {
        max = Number(maxRange);

        if (!Number.isFinite(max) || max < 0) {
            throw new ApiError(400, "Invalid maximum range");
        }
    }

    if (min !== null && max !== null && min > max) {
        throw new ApiError(
            400,
            "Minimum range cannot be greater than maximum range"
        );
    }

    const match = {};

    if (state !== undefined) {
        match["location.state"] = state;
    }

    if (city !== undefined) {
        match["location.city"] = city;
    }

    if (min !== null || max !== null) {
        match.rent = {};

        if (min !== null) {
            match.rent.$gte = min;
        }

        if (max !== null) {
            match.rent.$lte = max;
        }
    }

    if (type !== undefined) {
        match.type = {
            $in: type
        };
    }

    if (gender !== undefined) {
        match.allowedGenders = {
            $in: gender
        };
    }

    let page = Number(req.query.page ?? 1);

    if (!Number.isInteger(page) || page < 1) {
        throw new ApiError(400, "Invalid page");
    }

    if (!Number.isInteger(page) || page < 1) {
        throw new ApiError(400, "Invalid page");
    }

    const skip = (page - 1) * 20;

    const result = await Hostel.aggregate([
        {
            $match: match
        },
        {
            $skip:skip
        },
        {
            $limit:20
        },
        {
            $lookup:{
                from:'users',
                localField:'owner',
                foreignField:'_id',
                pipeline:[
                    {
                        $project:{
                            fullname:1,
                            email:1,
                            mobileNumber:1
                        }
                    }
                ],
                as:'owner'
            }
        },
        {
            $unwind:{
                path:'$owner'
            }
        },
        {
            $project:{
                hostelName:1,
                "location.address":1,
                "location.googleMapLink":1,
                "location.state":1,
                "location.city":1,
                "location.area":1,
                rent:1,
                type:1,
                facilities:1,
                "photos.url":1,
                allowedGenders:1,
                "owner.fullname":1,
                "owner.mobileNumber":1,
                "owner.email":1,
            }
        }
    ]);

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            result,
            'Successfully fetched the hostels'
        )
    );
})

const getMyHostels = AsyncHandler(async(req,res)=> {

    const myHostels = await Hostel.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(req.user._id)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner",
                pipeline: [
                    {
                        $project: {
                            fullname: 1,
                            email: 1,
                            mobileNumber: 1
                        }
                    }
                ]
            }
        },
        {
            $unwind: "$owner"
        },
        {
            $project: {
                hostelName: 1,
                "location.address": 1,
                "location.googleMapLink": 1,
                "location.state": 1,
                "location.city": 1,
                "location.area": 1,
                rent: 1,
                type: 1,
                facilities: 1,
                "photos.url": 1,
                allowedGenders: 1,
                owner: 1
            }
        }

    ])

    return res
    .status(200)
    .json(
        new ApiResponse(200, myHostels, "Your hostels fetched successfully")
    )
})

const updateHostel = AsyncHandler(async(req, res)=>{
    const {hostelname, address, type, gender, googleMapLink} = req.body;
    let { rent, facilities } = req.body;

    const updateData = {};

    if(hostelname!==undefined){

        if(hostelname.trim()===''){
            throw new ApiError(400, 'Hostel name must required')
        }

        updateData.hostelName = hostelname
    }

    if(googleMapLink !== undefined){

        if(googleMapLink.trim()===''){
            throw new ApiError(400, 'google map link must required')
        }

        updateData['location.googleMapLink'] = googleMapLink

    }

    if(address!==undefined){
        
        if(address.trim()===''){
            throw new ApiError(400, 'Address must required')
        }

        updateData['location.address']= address
    }

    if(type!==undefined){
        if(typeof type !== 'string'){
            throw new ApiError(400,'type format is not valid')
        }

        if(!['hostel','pg'].includes(type.toLowerCase())){
            throw new ApiError(400, 'type is not valid')
        }

        updateData.type=type.toLowerCase()

    }

    if(gender!==undefined){
        if(!Array.isArray(gender)){
            throw new ApiError(400, 'gender format is invalid')
        }

        if(gender.length>0){
            const normalizedGender = gender.map(g=>g.toLowerCase());

            if(!normalizedGender.every(g=>['male','female'].includes(g))){
                throw new ApiError(400, 'gender is invalid')
            }

            updateData.gender=normalizedGender
        }

    }

    if(rent!==undefined){
        rent=Number(rent);

        if(!Number.isInteger(rent) || rent<=0){
            throw new ApiError(400, 'rent must be a positive integer number')
        }

        updateData.rent=rent;
    }

    if(facilities!==undefined){

        let parsedFacilities;

        if(typeof facilities !== 'object'){
            try {
                parsedFacilities = JSON.parse(facilities)
            } catch (error) {
                throw new ApiError(400,'invalid facilities JSON')
            }
        }
        else{
            parsedFacilities=facilities
        }

        if(parsedFacilities===null || Array.isArray(parsedFacilities) || typeof parsedFacilities !== 'object'){
            throw new ApiError(400, 'invalid format of the facilities')
        }

        const allowedFacilities = ["wifi","ac","laundry","parking","food","hotWater","security"]

        if(!Object.entries(parsedFacilities).every(
            ([key,value])=>{
                return allowedFacilities.includes(key)
                && typeof value === 'boolean'
            }
        )){
            throw new ApiError(400, 'facilities are invalid')
        }

        updateData.facilities=parsedFacilities

    }

    if (Object.keys(updateData).length === 0) {
        throw new ApiError(400, 'No data provided for update');
    }

    const result = await Hostel.findOneAndUpdate(
        {
            owner:req.user._id
        },
        {
            $set:updateData
        },
        {
            returnDocument:'after'
        }
    )

    if(!result){
        throw new ApiError(404, 'Hostel not found')
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            result,
            'Successfully update the data'
        )
    )

    

})

const deleteHostel = AsyncHandler(async(req,res)=> {
    const {hostelId} = req.params

    if(!mongoose.isValidObjectId(hostelId)){
        throw new ApiError(400, "Invalid Hostel Id")
    }

    const hostel = await Hostel.findOne({
        owner: req.user._id,
        _id: hostelId
    });

    if (!hostel) {
        throw new ApiError(404, "Hostel not found");
    }

    const result = await Promise.allSettled(
        hostel.photos.map((photo) =>
            DeleteOnCloudinary(photo.public_id, photo.resourceType, photo.type)
        )
    );

    const verifyId = hostel.verificationId

    result.forEach((result, index) => {
        if (result.status === "rejected") {
            console.error(
                `Failed to delete Cloudinary photo: ${hostel.photos[index].publicId}`,
                result.reason
            );
        }
    });

    const documentData = await VerifyDocument.findByIdAndDelete(
        verifyId,
        {
            new:false
        }
    );

    if(!documentData){
        throw new ApiError(400,"Hostel document data not found")
    }

    await DeleteOnCloudinary(documentData.document.public_id, documentData.document.resourceType, documentData.document.type)

    await Hostel.findByIdAndDelete(hostel._id)

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                {},
                "Hostel deleted successfully"
            )
        );
})

const addHostelPhotos = AsyncHandler(async(req,res)=> {
    const {hostelId} = req.params

    const hostel = await Hostel.findOne({
        _id: hostelId,
        owner: req.user._id
    })

    if(!hostel){
        throw new ApiError(404, "Hostel not found")
    }

    const photosLocalPath = req.files?.map((file)=> file.path)

    if(!photosLocalPath?.length){
        throw new ApiError(400, "At least one photo is required")
    }

    if(hostel.photos.length + photosLocalPath.length > 8){
        throw new ApiError(400, `You can add only ${8 - hostel.photos.length} more photos`)
    }

    const uploadPhotos = []

    try{
        for(const path of photosLocalPath){
            const photo = await uploadOnCloudinary(path)

            if(!photo?.url || !photo?.public_id || !photo?.resource_type || !photo?.type){
                throw new Error("Photo upload failed")
            }

            uploadPhotos.push({
                url: photo.url,
                public_id: photo.public_id,
                resourceType: photo.resource_type,
                type: photo.type
            })

        }
        hostel.photos.push(...uploadPhotos)
        await hostel.save()

    } catch(error){
        for(const photo of uploadPhotos){
            try{
                await DeleteOnCloudinary(photo.public_id, photo.resourceType, photo.type)
            }
            catch(cleanupError){
                console.log("Failed to cleanup hostel photo:",cleanupError)
            }
        }
        throw new ApiError(500, "failed to upload photos")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, hostel.photos.url, "Photo added successfully")
    )

})

const deleteHostelPhotos = AsyncHandler(async(req,res)=> {
    const {hostelId} = req.params
    if (!mongoose.isValidObjectId(hostelId)) {
        throw new ApiError(400, "Invalid Hostel Id");
    }

    const {photoIds} = req.body
    if(!Array.isArray(photoIds) || !photoIds.length){
        throw new ApiError(400, "Atleast one photoId required")
    }

    const hostel = await Hostel.findOne({
        _id: hostelId,
        owner: req.user._id
    })

    if(!hostel){
        throw new ApiError(404, "Hostel not found")
    }

    const uniquePhotoIds = [...new Set(photoIds)];

    const deletePhotos = hostel.photos.filter((photo)=> 
        uniquePhotoIds.includes(photo._id.toString())
    )

    const invalidPhotoIds = uniquePhotoIds.length - deletePhotos.length

    if(invalidPhotoIds > 0){
        throw new ApiError(400, `${invalidPhotoIds} photos are invalid`)
    }

    if (hostel.photos.length - deletePhotos.length < 2) {
        throw new ApiError(
            400,
            "Hostel must have at least 2 photos"
        );
    }

    hostel.photos = hostel.photos.filter((photo)=>
        !uniquePhotoIds.includes(photo._id.toString())
    )

    await hostel.save()

    for(const photo of deletePhotos){
        try{
            await DeleteOnCloudinary(photo.public_id, photo.resourceType, photo.type)
        }

        catch(cleanupError){
            console.log(`Failed to delete photo: ${photo.public_id}`,cleanupError)
        }
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, hostel.photos, "Hostel photos deleted successfully")
    )
})

export {
    createHostel,
    verifyHostel,
    getHostelById,
    getAllHostel,
    getMyHostels,
    deleteHostel,
    updateHostel,
    addHostelPhotos,
    deleteHostelPhotos
}