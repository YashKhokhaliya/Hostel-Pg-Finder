import { AsyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js"
import { uploadOnCloudinary, DeleteOnCloudinary } from "../utils/Cloudinary.js";
import { User } from "../models/user.model.js";
import generateOTP from "../utils/otpGenerate.js";


const userRegistration = await AsyncHandler(async(req, res)=>{
    const {username, fullname, email, password, gender, number, role} = req.body;

    // validate all the field
    // validate gender
    // validate role
    // validate password
    // validate contact number
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
            $or:[{number, email}]
        }
    )

    if(existedUser){
        throw new ApiError(409,'Username with email or mobile number already exists')
    }

    // verify the user mail
    const otp=generateOTP()
    


    
})

export{
    userRegistration,
}