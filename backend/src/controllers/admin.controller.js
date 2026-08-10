import { AsyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Hostel } from "../models/hostel.model.js";
import { User } from "../models/user.model.js";
import { VerifyDocument } from "../models/hostelVerification.model.js";
import mongoose from "mongoose";
import {generateVerificationDocumentUrl} from "../utils/cloudinary.js"

const getRequest = AsyncHandler( async(req, res) => {
    const requests = await VerifyDocument
    .find({
        city: req.user?.city,
        status: "Pending"
    })
    .select("_id owner createdAt")
    .sort({ createdAt: -1 })
    .lean();

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            requests,
            "Verification requests fetched successfully"
        )
    );
})

const getRequestById = AsyncHandler( async(req, res) => {
    const {verifyId} = req.params;

    if(!mongoose.Types.ObjectId.isValid(verifyId)){
        throw new ApiError(400,'Invalid verification request ID')
    }

    const request = await VerifyDocument.aggregate([
        {
            $match:{
                _id:new mongoose.Types.ObjectId(verifyId),
                city:req.user?.city
            }
        },
        {
            $lookup:{
                from:'users',
                localField:'owner',
                foreignField:'_id',
                pipeline:[
                    {
                        $project:{
                            _id:0,
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
                _id:1,
                owner:1,
                documentType:1,
                documentPublicId:1,
                documentResourceType:1,
                createdAt:1
            }
        }
    ])

    if (!request.length) {
        throw new ApiError(404, "Verification request not found");
    }

    if(request[0]){
        const signedUrl = generateVerificationDocumentUrl(request[0]?.documentPublicId, request[0]?.documentResourceType)
        request[0].document_url=signedUrl;
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            request[0],
            'Request data fetched successfully'
        )
    )
})

// const rejectRequestById = AsyncHandler( async(req, res) => {

// })

// const acceptRequestById = AsyncHandler( async(req, res)=>{

// })

export {
    getRequest,
    getRequestById
}
