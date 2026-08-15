import { Rating } from "../models/rating.model.js";
import { User } from "../models/user.model.js";
import { AsyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

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

export {
    removeRating
}