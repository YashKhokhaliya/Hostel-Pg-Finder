import { Rating } from "../models/rating.model.js";
import { User } from "../models/user.model.js";
import { AsyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Hostel } from "../models/hostel.model.js";
import mongoose from "mongoose";

const removeRating = AsyncHandler(async(req, res) => {

    const {hostelId} = req.params;

    const result = await Rating.findOneAndDelete(
        {
            user:req.user._id,
            hostel:hostelId
        }
    )

    if(!result){
        throw new ApiError(404,'Rating not found')
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            "Rating removed successfully"
        )
    )

})

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

const updateRating = AsyncHandler(async(req,res)=> {
    const {rating, comment} = req.body
    const {ratingId} = req.params
    if(!mongoose.isValidObjectId(ratingId)){
        throw new ApiError(400, "Rating id is not valid")
    }

    const updateData = {}
    if(rating!==undefined){
        const ratingValue = Number(rating)
        if(!Number.isInteger(ratingValue) || !rating || ratingValue < 1 || ratingValue > 5){
            throw new ApiError(400, "Rating must be between 1 to 5")
        }

        updateData.rating = ratingValue
    }

    if(comment!==undefined){
        if (typeof comment !== "string") {
            throw new ApiError(400, "Comment must be a string")
        }
        if (comment.trim().length > 500) {
            throw new ApiError(400, "Comment cannot exceed 500 characters");
        }

        updateData.comment = comment
    }

    if(Object.keys(updateData).length===0){
        throw new ApiError(400, "At least one field is required to update")
    }

    const updateRating = await Rating.findOneAndUpdate(
        {
            _id: ratingId,
            user: req.user._id,
        },
        updateData,
        {
            new: true,
            runValidators: true
        }
    )

    if(!updateRating){
        throw new ApiError(404, "Rating not found or you are not allowed to update it")
    }

    const ratingResponse = updateRating.toObject();
    delete ratingResponse.__v;

    return res
    .status(200)
    .json(
        new ApiResponse(200, ratingResponse, "Rating updated successfully")
    )

})

const getHostelRatings = AsyncHandler(async(req,res)=> {
    const {hostelId} = req.params
    if(!mongoose.isValidObjectId(hostelId)){
        throw new ApiError(400, "HostelId is not valid")
    }

    const {page = 1, limit = 10} = req.query
    const pageNumber = Number(page);
    const limitNumber = Number(limit);

    const hostel = await Hostel.findById(hostelId)
    if(!hostel){
        throw new ApiError(404, "Hostel Not Found")
    }

    const ratings = Rating.aggregate([
        {
            $match: {
                hostel: new mongoose.Types.ObjectId(hostelId)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "user",
                foreignField: "_id",
                as: "user",
                pipeline: [
                    {
                        $project: {
                            fullname: 1,
                            username: 1,
                            profilePhoto: "$profilePhoto.url"
                        }
                    }
                ]
            }
        },
        {
            $unwind: "$user"
        },
        {
            $sort: {
                createdAt: -1
            }
        },
        {
            $project: {
                _id:1,
                rating: 1,
                comment: 1,
                createdAt: 1,
                updatedAt: 1,
                user: 1
            }
        }
        
    ])

    const hostelRatings = await Rating.aggregatePaginate(
        ratings,
        {
            page: pageNumber,
            limit: limitNumber
        }
    )

    const ratingStats = await Rating.aggregate([
        {
            $match: {
                hostel: new mongoose.Types.ObjectId(hostelId)
            }
        },
        {
            $group: {
                _id: null,
                ratingCount: { $sum: 1 },
                averageRating: { $avg: "$rating" }
            }
        },
        {
            $project: {
                _id: 0,
                ratingCount: 1,
                averageRating: {
                    $round: ["$averageRating", 1]
                }
            }
        }
    ]);

    const stats = ratingStats[0] || {
        ratingCount: 0,
        averageRating: 0
    };

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            {
                hostelRatings,
                ratingCount: stats.ratingCount,
                averageRating: stats.averageRating
            },
            "Hostel Ratings fetched successfully"
        )
    )

})

export {
    removeRating,
    addRating,
    updateRating,
    getHostelRatings
}