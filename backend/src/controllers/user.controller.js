import { AsyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js"
import { uploadOnCloudinary, DeleteOnCloudinary } from "../utils/Cloudinary.js";
import { User } from "../models/user.model.js";
import generateOTP from "../utils/otpGenerate.js";
import { storeOTP, verifyOTP } from "../services/otp.service.js";
import { sendOTPEmail,sendWelcomeEmail } from "../services/mail.service.js";
import { redisClient } from "../config/redis.config.js";

const userRegistration = AsyncHandler(async(req, res)=>{
    const {username, fullname, email, password, gender, number, role} = req.body;
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
    if (!["student", "owner"].includes(role.toLowerCase())) {
        throw new ApiError(
            400,
            "Role must be either student or owner"
        );
    }

    // password must be in the format
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;

    if (!passwordRegex.test(password)) {
        throw new ApiError(
            400,
            "Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one digit, and one special character"
        );
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
    let result;
    try {
    
        if(path){
            result = await uploadOnCloudinary(path);
        }
    
        const user = await User.create({
            username:username,
            email:email,
            mobileNumber:number,
            fullname:fullname,
            profilePhoto:result?.url,
            profilePhotoPublicId:result?.public_id,
            gender:gender,
            role:role,
            password:password,
        })
    
        const response = await User.findById(user._id).select("-password")
    
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
            await DeleteOnCloudinary(result?.public_id)
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

    
    //store into radis
    await storeOTP(user.email, otp);

    //send to user email
    try {
        await sendOTPEmail(user.email, otp);
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
            await sendWelcomeEmail(user.email, user.username)
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

    const userProfilePhotoPublicID = user?.profilePhotoPublicId

    const result = await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset:{
                profilePhoto:1,
                profilePhotoPublicId:1
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
        await DeleteOnCloudinary(userProfilePhotoPublicID)
    } catch (error) {

        await User.findByIdAndUpdate(
            req.user._id,
            {
                $set:{
                    profilePhoto:userProfilePhoto,
                    profilePhotoPublicId:userProfilePhotoPublicID
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

    const currentPublicId = user.profilePhotoPublicId

   try{
        user.profilePhoto= profilePhoto.url
        user.profilePhotoPublicId= profilePhoto.public_id

        await user.save({validateBeforeSave: false})
    } catch(error){
        try {
            await DeleteOnCloudinary(profilePhoto.public_id);
        } catch (cleanupError) {
            console.log(
                "Failed to cleanup newly uploaded profile photo:",
                cleanupError
            );
        }

        throw error;
    }

    if (currentPublicId) {
        try {
            await DeleteOnCloudinary(currentPublicId);
        } catch (error) {
            console.log("Failed to delete old profile photo:", error);
        }
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, {profilePhoto: user.profilePhoto}, "Profile photo updated successfully")
    )
})

export{
    userRegistration,
    requestLoginOtp,
    userLogin,
    userLogout,
    userProfilePhotoDelete,
    updatePassword,
    updateProfilePhoto
}