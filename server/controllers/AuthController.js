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
            return next(new ApiError(400, "Account Already Exists With The Email:", email));
        }

        const user = await User.create({ email, password });


        const createdUser = await User.findById(user._id).select(
            "-password "
        );


        if (!createdUser) {
            return next(new ApiError(500, "Something Went Wrong While Creating the User"));
        }

        res.cookie("jwt", createdUser.generateAccessToken(), {
            maxAge: process.env.EXPIRY,
            secure: true,
            sameSite: 'none'
        });
        return res
            .status(201)
            .json(new ApiResponse(200, createdUser, "User registered Succesfully"));
    } catch (error) {
        next(error);
    }
});


export const login = asyncHandler(async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return next(new ApiError(400, "Email And Password is Required"));
        }

        const user = await User.findOne({ email });


        if (!user) {
            return next(new ApiError(400, "No user registered with the given email"));
        }


        const auth = await user.isPasswordCorrect(password);

        if (!auth) {
            return next(new ApiError(400, "Password is incorrect"));
        }

        res.cookie("jwt", user.generateAccessToken(), {
            maxAge: process.env.EXPIRY,
            secure: true,
            sameSite: 'none'
        });



        // Omit password field before sending user data
        const { password: _, ...userWithoutPassword } = user.toObject();

        // Send response to frontend
        return res.status(200).json({
            message: "Login successful",
            user: userWithoutPassword
        });


    } catch (error) {

    }
});