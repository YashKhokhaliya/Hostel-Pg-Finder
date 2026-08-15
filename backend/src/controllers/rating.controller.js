import { AsyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import { Hostel } from "../models/hostel.model.js";
import {Rating} from "../models/rating.model.js"
import mongoose from "mongoose";

const addRating = AsyncHandler(async(req,res)=> {
    const {hostelId} = req.params
    if(!mongoose.isValidObjectId(hostelId)){
        throw new ApiError(400, "hostelId is not valid")
    }

    const {rating, comment} = req.body
    const ratingValue = Number(rating)
    if(!Number.isInteger(ratingValue) || !rating || ratingValue < 1 || ratingValue > 5){
        throw new ApiError(400, "Rating must be between 1 to 5")
    }

    if (comment !== undefined && typeof comment !== "string") {
        throw new ApiError(400, "Comment must be a string");
    }

    if (typeof comment === "string" && comment.trim().length > 500) {
        throw new ApiError(400, "Comment cannot exceed 500 characters");
    }

    const hostel = await Hostel.findById(hostelId)
    if(!hostel){
        throw new ApiError(404, "Hostel not found")
    }

    const existingRating = await Rating.findOne({
        user: req.user._id,
        hostel: hostelId
    })

    if(existingRating){
        throw new ApiError(409, "You have already rated this hostel")
    }


    const newRating = await Rating.create({
        user: req.user._id,
        hostel: hostelId,
        rating: ratingValue,
        comment
    })    

    const ratingResponse = newRating.toObject();
    delete ratingResponse.__v;

    return res
    .status(201)
    .json(
        new ApiResponse(201, ratingResponse, "Rating added successfully")
    )
})

export {
    addRating
}