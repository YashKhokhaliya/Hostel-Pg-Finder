import { Hostel } from "../models/hostel.model.js";
import { favoriteHostel } from "../models/favoriteHostel.model.js";
import { AsyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

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

export {
    addHostel
}