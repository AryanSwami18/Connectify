import User from "../models/UserModel.js";
import { ApiError } from "../utils/APIError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";




// Function for Signup
export const signup = asyncHandler(async (req, res, next) => {
    try {
        const { email, password, confirmPassword } = req.body;
        if (!email || !password) {
            return next(new ApiError(400, "Email and Password is Required"));
        }

        const existedUserEmail = await User.findOne({ email });

        if (password.trim() != confirmPassword.trim()) {
            return next(new ApiError(400, 'confirm Password dose not  match'));
        }
        if (existedUserEmail) {
            return next( new ApiError(400, "Account Already Exists With The Email:", email));
        }

        const user = await User.create({ email, password });


        const createdUser = await User.findById(user._id).select(
            "-password "
        );


        if (!createdUser) {
            return next( new ApiError(500, "Something Went Wrong While Creating the User"));
        }

        res.cookie("jwt",createdUser.generateAccessToken(),{
            maxAge:process.env.EXPIRY,
            secure:true,
            sameSite:'none'
        });
        return res
            .status(201)
            .json(new ApiResponse(200, createdUser, "User registered Succesfully"));
    } catch (error) {
        next(error);
    }
});


export const login = asyncHandler(async(req,res,next) = {
    
});