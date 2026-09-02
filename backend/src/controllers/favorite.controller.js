import { Hostel } from "../models/hostel.model.js";
import { favoriteHostel } from "../models/favoriteHostel.model.js";
import { AsyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import mongoose from "mongoose";

const addHostel = AsyncHandler(async(req, res)=>{
    const {hostelId} = req.params
    try {
        await favoriteHostel.findOneAndUpdate(
            {user:req.user._id},
            {
                $addToSet:{
                    hostels:hostelId
                }
            },
            {
                upsert:true
                // If the user's FavoriteHostel document doesn't exist,
                // create it; otherwise update the existing document.
            }
        )
    }
    catch (error) {
        throw new ApiError(500,'Failed to add into favorite list')
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            "Hostel added to favorite list successfully"
        )
    )

})

const removeHostel = AsyncHandler(async(req, res)=>{
    const {hostelId} = req.params;

    try {
        const result = await favoriteHostel.findOneAndUpdate(
            {
                user:req.user._id,
                hostels:hostelId
            },
            {
                $pull:{
                    hostels:hostelId
                }
            }
        )

        if(!result) {
            throw new ApiError(404,'Hostel not found in the favorite list')
        }

        return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                "hostel removed from favorite list successfully"
            )
        )
    }
    catch (error) {
        if(error instanceof ApiError){ // if the error occurs because of hostel not found then just throw that error
            throw error
        }
        throw new ApiError(500, 'Failed to remove hostel from favorite list')
    }
})

const getMyFavoriteHostels = AsyncHandler(async(req, res)=>{
    try {
        const result = await favoriteHostel.aggregate([
            {
                $match:{
                    user:new mongoose.Types.ObjectId(req.user._id)
                }
            },
            {
                $lookup:{
                    from:'hostels',
                    localField:'hostels',
                    foreignField:'_id',
                    pipeline:[
                        {
                            $project:{
                                _id:1,
                                rent:1,
                                type:1,
                                allowedGenders:1,
                                hostelName:1
                            }
                        }
                    ],
                    as:'hostels'
                }
            }
        ])

        return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                result[0]?.hostels || [],
                "successfully fetched all the favorite hostels"
            )
        )
    } catch (error) {
        console.log('REAL-ERROR:-', error);
        throw new ApiError(500, 'Failed to fetch favorite hostels')
    }
})
export {
    addHostel,
    removeHostel,
    getMyFavoriteHostels
}