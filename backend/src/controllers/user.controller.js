import { AsyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js"
import { uploadOnCloudinary, DeleteOnCloudinary } from "../utils/Cloudinary.js";
import { User } from "../models/user.model.js";
import generateOTP from "../utils/otpGenerate.js";
import { storeOTP, verifyOTP } from "../services/otp.service.js";
import { redisClient } from "../config/redis.config.js";

import emailQueue from "../queues/email.queue.js";

import jwt from "jsonwebtoken"
import { generatePasswordResetToken } from "../services/passwordReset.service.js";
import { optsDecodeMap } from "bullmq";


const generateAccessAndRefreshToken = async(userId)=>{
    try{
        const user = await User.findById(userId)
        const refreshToken = user.generateRefreshToken()
        const accessToken = user.generateAccessToken()

        user.refreshToken = refreshToken
        await user.save({validateBeforeSave: false})

        return {accessToken, refreshToken}
    } catch(error){
        throw new ApiError(500, "Something went wrong while generating refresh and access token")
    }
}

const userRegistration = AsyncHandler(async(req, res)=>{
    const {username, fullname, email, password, gender, number, role, city} = req.body;
    const path = req.file?.path;

    // validate all the field
    // validate gender
    // validate role
    // validate password
    // validate contact numberS
    // validate email
    if(
        [username, fullname, email, password, gender, number, role].some((field)=> !field || field.trim()==='')
    ){
        throw new ApiError(400,'All fields are required')
    }

    // validate gender
    if (!["male", "female", "other"].includes(gender.toLowerCase())) {
        throw new ApiError(
            400,
            "Gender is not valid"
        );
    }

    // role either be owner or student
    if (!["student", "owner", "admin"].includes(role.toLowerCase())) {
        throw new ApiError(
            400,
            "Role must be student or owner or admin"
        );
    }

    // password must be in the format
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;
    const usernameRegex = /^[A-Za-z0-9]{4,}$/;
    const fullnameRegex = /^(?=.{3,50}$)[A-Za-z]+(?: [A-Za-z]+){0,2}$/

    if (!passwordRegex.test(password)) {
        throw new ApiError(
            400,
            "Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one digit, and one special character"
        );
    }

    if(!usernameRegex.test(username)){
        throw new ApiError(
            400,
            "Username must be at least 4 characters long and contain both letters and numbers. No spaces or special characters are allowed."
        )
    }

    if(!fullnameRegex.test(fullname)){
        throw new ApiError(
            400,
            "Full name must contain only alphabets, have at most 2 spaces, and be between 3 and 50 characters long."
        )
    }

    // validate contact number
    if (!/^(?:\+91)?[6-9]\d{9}$/.test(number)) {
        throw new ApiError(400, "Contact number is not valid");
    }

    // validate email
    if (!(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))) {
        throw new ApiError(400,"Email is not valid");
    }

    // check whether the user already exists or not
    const existedUser=await User.findOne(
        {
            $or:[
                {username},
                {email},
                {mobileNumber:number}
            ]
        }
    )

    if(existedUser){
        throw new ApiError(409,'username, email or mobile number already exists')
    }

    if(role==='Admin' && !city){
        throw new ApiError(400, 'Admin must register with city')
    }
    
    let result;
    try {
    
        if(path){
            result = await uploadOnCloudinary(path);
        }
    
        const user = await User.create({
            username:username,
            email:email.toLowerCase(),
            mobileNumber:number,
            fullname:fullname.toLowerCase(),
            profilePhoto:{
                url:result?.url,
                public_id:result?.public_id,
                resourceType:result?.resource_type,
                type:result?.type
            },
            gender:gender,
            role:role,
            city:city.toLowerCase(),
            password:password,
        })
    
        const response = await User.findById(user._id).select("-password -__v")
    
        if(!response){
            throw new ApiError(500, 'Failed to fetch the newly registered user')
        }
    
        return res
        .status(201)
        .json(
            new ApiResponse(
                201,
                response,
                'Successfully registered the user'
            )
        )
    
    } catch (error) {
        if(result?.public_id){
            await DeleteOnCloudinary(result?.public_id, result?.resource_type, result?.type)
        }
        throw new ApiError(
            error.statusCode || 500,
            error.message || "Failed to register the user"
        );
    }
})

const requestLoginOtp = AsyncHandler(async(req,res)=>{
    const {email, password} = req.body

    if(!email || !password){
        throw new ApiError(400, "Email and Password are required")
    }

    const user = await User.findOne({
        email: email.trim().toLowerCase()
    })

    if(!user){
        throw new ApiError(401, "Invalid email or password")
    }

    const isPasswordValid = await user.isPasswordCorrect(password)

    if(!isPasswordValid){
        throw new ApiError(401, "Invalid email or password")
    }

    //otp Generation

    const otp = generateOTP();

    //store into redis
    await storeOTP(user.email, otp);

    //send to user email
    try {
        await emailQueue.add('send-otp',{
            email:email,
            otp:otp
        })

    } catch (error) {

        console.error("Failed to send login OTP:", error);
        await redisClient.del(`otp:${user.email}`);

        throw new ApiError(
            500,
            "Failed to send OTP. Please try again."
        );
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            {
                email: user.email
            },
            "Otp sent successfully"
        )
    )
})

const userLogin = AsyncHandler(async (req,res) => {
    const {email, otp} = req.body

    if(!email?.trim() || !otp){
        throw new ApiError(400, "email and otp required")
    }

    const user = await User.findOne({
        email: email.trim().toLowerCase()
    })

    if(!user){
        throw new ApiError(401, "Invalid user request")
    }

    const userAlreadyVerified = user.isVerified
    //verify otp
    await verifyOTP(user.email, String(otp))

    const accessToken = user.generateAccessToken()
    const refreshToken = user.generateRefreshToken()

    user.refreshToken = refreshToken
    user.isVerified = true

    await user.save({
        validateBeforeSave: false
    })

    if(!userAlreadyVerified){
        try{
            if(user.role==='student'){
                await emailQueue.add('welcome-student',{
                    email:email,
                    username:user.username
                })
            }
            else if(user.role==='owner'){
                await emailQueue.add('welcome-owner',{
                    email:email,
                    username:user.username
                })
            }
            else {
                await emailQueue.add('welcome-admin',{
                    email:email,
                    username:user.username
                })
            }
            
        } catch(error){
            console.error(`Welcome email failed for ${user.email}:`,error.message)
        }
    }

    const loggedInUser = await User.findById(user._id)
    .select("-refreshToken -password -__v")

    const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite:
        process.env.NODE_ENV === "production"
        ? "none"
        : "lax",
    };

    return res
    .status(200)
    .cookie("accessToken", accessToken, cookieOptions)
    .cookie("refreshToken", refreshToken, cookieOptions)
    .json(
        new ApiResponse(
            200,
            {
                user: loggedInUser,
                accessToken,
                refreshToken
            },
            "User Logged In Successfully"
        )
    )
})

const updatePassword = AsyncHandler(async (req,res)=> {
    const {oldPassword, newPassword, confirmPassword} = req.body

    if(!oldPassword || !newPassword || !confirmPassword){
        throw new ApiError(400, "Old password, new password, and confirm password are required")
    }

    if(newPassword !== confirmPassword){
        throw new ApiError(400, "newPassword and confirmPassword must match")
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;

    if (!passwordRegex.test(newPassword)) {
        throw new ApiError(
            400,
            "Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one digit, and one special character"
        );
    }

    const user = await User.findById(req.user._id)
    if(!user){
        throw new ApiError(404, "User not found")
    }

    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

    if(!isPasswordCorrect){
        throw new ApiError(400, "Invalid old password")
    }

    const isSamePassword = await user.isPasswordCorrect(newPassword);

    if (isSamePassword) {
        throw new ApiError(
            400,
            "New password must be different from the current password"
        );
    }

    user.password = newPassword
    await user.save()

    return res
    .status(200)
    .json(
        new ApiResponse(200, {}, "Password updated successfully")
    )
})

const userLogout = AsyncHandler(async (req, res)=> {
    const user = await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset:{
                refreshToken:1
            }
        },
        {
            new:true
        }
    );
        
    if(!user){
        throw new ApiError(404, 'User not found')
    }

    return res
    .clearCookie("accessToken")
    .clearCookie("refreshToken")
    .status(200)
    .json(
        new ApiResponse(
            200,
            "user logged out successfully"
        )
    )
})

const userProfilePhotoDelete = AsyncHandler(async(req, res)=>{
    const user = await User.findById(req.user._id)

    if(!user) throw new ApiError(404,"User not found")

    const userProfilePhoto = user?.profilePhoto
    
    if(!userProfilePhoto){
        return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                "Profile photo removed successfully"
            )
        )
    }

    const userProfilePhotoPublicID = user?.profilePhoto?.public_id
    const userProfilePhotoResourceType = user?.profilePhoto?.resourceType
    const userProfilePhotoType = user?.profilePhoto?.type
    const userProfilePhotoUrl = user?.profilePhoto?.url

    const result = await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset:{
                profilePhoto:1
            }
        },
        {
            new:true
        }
    )

    if(!result)  {
        throw new ApiError(500,"Failed to remove the profile photo")
    }

    try {
        await DeleteOnCloudinary(userProfilePhotoPublicID, userProfilePhotoResourceType, userProfilePhotoType)
    } catch (error) {

        await User.findByIdAndUpdate(
            req.user._id,
            {
                $set: {
                    "profilePhoto.url": userProfilePhotoUrl,
                    "profilePhoto.public_id": userProfilePhotoPublicID,
                    "profilePhoto.resourceType": userProfilePhotoResourceType,
                    "profilePhoto.type":userProfilePhotoType
                }
            },
            {
                new:true
            }
        )

        throw new ApiError(500, "Failed to remove the profile photo")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            "Profile photo removed successfully"
        )
    )
})

const updateProfilePhoto = AsyncHandler(async (req,res)=> {
    const profileLocalPath = req.file?.path

    if(!profileLocalPath){
        throw new ApiError(400, "profilePhoto file is missing")
    }

    const user = await User.findById(req.user._id)

    if(!user){
        throw new ApiError(404, "User not found")
    }

    const profilePhoto = await uploadOnCloudinary(profileLocalPath)

    if(!profilePhoto?.url || !profilePhoto?.public_id){
        throw new ApiError(500, "Error while uploading photo")
    }

    // old photo's detail
    const userProfilePhotoPublicID = user.profilePhoto?.public_id
    const userProfilePhotoResourceType = user.profilePhoto?.resourceType
    const userProfilePhotoType = user.profilePhoto?.type
    const userProfilePhotoUrl = user.profilePhoto?.url

    try{
        // new photo's detail
        user.profilePhoto.url = profilePhoto.url
        user.profilePhoto.public_id = profilePhoto.public_id
        user.profilePhoto.resourceType = profilePhoto.resource_type
        user.profilePhoto.type = profilePhoto.type

        await user.save({validateBeforeSave: false})

    } catch(error){
        // restore old photos
        user.profilePhoto.url = userProfilePhotoUrl
        user.profilePhoto.public_id = userProfilePhotoPublicID
        user.profilePhoto.resourceType = userProfilePhotoResourceType
        user.profilePhoto.type = userProfilePhotoType

        await user.save({validateBeforeSave: false})

        // remove new photo detail
        await DeleteOnCloudinary(profilePhoto.public_id, profilePhoto.resource_type, profilePhoto.type)

        throw new ApiError(500, 'Failed to remove old photos')
    }

    // remove the old photo's detail
    await DeleteOnCloudinary(userProfilePhotoPublicID, userProfilePhotoResourceType, userProfilePhotoType)

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            profilePhoto.url,
            "Successfully changed the profile photo"
        )
    )
})

const getCurrentUser = AsyncHandler(async(req, res)=>{
    if (!req.user?._id) {
        throw new ApiError(401, 'Unauthorized request');
    }

    const user = await User.findById(req.user?._id).select('-password -refreshToken -__v');

    if(!user) {
        throw new ApiError(404, 'User not found')
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            user,
            'User fetched successfully'
        )
    )
    
})

const refreshAccessToken = AsyncHandler(async (req,res)=> {
    const incomingRefreshToken = req.cookies?.refreshToken || req.body?.refreshToken

    if(!incomingRefreshToken){
        throw new ApiError(401, "unauthorized request")
    }

    try{
        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)

        const user = await User.findById(decodedToken?._id)

        if(!user){
            throw new ApiError(401, "Invalid refresh Token")
        }

        if(incomingRefreshToken !== user?.refreshToken){
            throw new ApiError(401, "Refresh token is expired or used")
        }

        const options = {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite:
            process.env.NODE_ENV === "production"
            ? "none"
            : "lax",
        }

        const {accessToken, refreshToken: newRefreshToken} = await generateAccessAndRefreshToken(user._id)

        return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", newRefreshToken, options)
        .json(
            new ApiResponse(
                200,
                {accessToken, refreshToken: newRefreshToken},
                "Access token refreshed"
            )
        )
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }

        if (
            error.name === "JsonWebTokenError" ||
            error.name === "TokenExpiredError"
        ) {
            throw new ApiError(401, "Invalid or expired refresh token");
        }

        throw new ApiError(500, "Internal server error");
    }
})

const forgetPasswordOtp = AsyncHandler(async(req, res)=>{
    const { email } = req.body;

    const existedEmail = await User.findOne( // it expects the object
        {email}
    );

    if(!existedEmail) {
        throw new ApiError(404, 'User not found')
    }

    const otp = generateOTP();

    await storeOTP(email, otp);

    await emailQueue.add('send-password-reset-otp',{
        email:email,
        otp:otp
    })

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            'Reset password OTP sent successfully'
        )
    )
})

const verifyOtpPasswordReset = AsyncHandler(async(req, res)=>{
    const {email, otp} = req.body;
    
    if(!email.toLowerCase().trim() || !otp) {
        throw new ApiError(400, "Otp or email is required")
    }

    const user = await User.findOne(
        {email}
    )

    if(!user) {
        throw new ApiError(404, 'User not found')
    }

    await verifyOTP(email, String(otp));

    const passwordResetToken = await generatePasswordResetToken(user._id)
    // generate the reset token

    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        maxAge:10*60*1000 // 10 minutes * 60 second * 1000 millisecond, after this cookie will remove this 
    }

    return res
    .status(200)
    .cookie('ResetToken',passwordResetToken, options)
    .json(
        new ApiResponse(
            200,
            'OTP verified successfully to reset password'
        )
    )
})

const resetPassword = AsyncHandler(async (req,res)=>{
    const {newPassword, confirmPassword} = req.body

    const resetToken = req.cookies?.ResetToken

    if (!resetToken) {
        throw new ApiError(
            401,
            "Unauthorized to reset password"
        );
    }

    if(!newPassword || !confirmPassword){
        throw new ApiError(400, "new password and confirm password are required")
    }

    if(newPassword !== confirmPassword){
        throw new ApiError(400, "new password and confirm password must match")
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;

    if (!passwordRegex.test(newPassword)) {
        throw new ApiError(
            400,
            "Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one digit, and one special character"
        );
    }

    const userId = await redisClient.get(
        `password_reset:${resetToken}`
    )

    if(!userId){
        throw new ApiError(401, "Reset token is invalid or expired")
    }

    const user = await User.findById(userId)

    if(!user) {
        throw new ApiError(404, 'User is not found')
    }

    user.password = newPassword
    await user.save()

    await redisClient.del(
        `password_reset:${resetToken}`
    )

    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite:
        process.env.NODE_ENV === "production"
        ? "none"
        : "lax",
    }

    return res
    .status(200)
    .clearCookie('ResetToken', options)
    .json(
        new ApiResponse(
            200,
            'reset password successfully'
        )
    )
})

const deleteUSer = AsyncHandler(async(req, res)=>{

    const existedUser = await User.findById(req.user?._id).select("profilePhoto");

    if(!existedUser) {
        throw new ApiError(404,"User not found")
    }

    const photoPublicId = existedUser.profilePhoto.public_id;
    const photoResourceType = existedUser.profilePhoto.resourceType;
    const photoType = existedUser.profilePhoto.type

    const result = await User.findByIdAndDelete(req.user._id);

    if(!result){
        throw new ApiError(500,'Failed to delete the user')
    }

    await DeleteOnCloudinary(photoPublicId, photoResourceType, photoType);

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            'User deleted successfully'
        )
    )
})

export{
    userRegistration,
    requestLoginOtp,
    userLogin,
    userLogout,
    userProfilePhotoDelete,
    updatePassword,
    updateProfilePhoto,
    getCurrentUser,
    refreshAccessToken,
    forgetPasswordOtp,
    verifyOtpPasswordReset,
    resetPassword,
    deleteUSer
}