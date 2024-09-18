import User from "../models/UserModel.js";
import { ApiError } from "../utils/APIError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadOnCloudinary, deleteFromCloudinary } from '../utils/cloudinary.js'
import sharp from 'sharp';



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

        res.cookie("jwt", await user.generateAccessToken(), {
            maxAge: parseInt(process.env.COOKIE_EXPIRY),
            httpOnly: true,
            sameSite: 'strict'
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

        res.cookie("jwt", await user.generateAccessToken(), {
            maxAge: parseInt(process.env.COOKIE_EXPIRY),
            httpOnly: true,
            sameSite: 'strict' // Adjust based on your needs
        });


        // Omit password field before sending user data
        const { password: _, ...userWithoutPassword } = user.toObject();

        // Send response to frontend
        return res.status(200).json({
            message: "Login successful",
            user: userWithoutPassword
        });


    } catch (error) {
        next(error);
    }
});


export const getUserInfo = asyncHandler(async (req, res, next) => {
    try {
        const user = req.user;
        // Send response to frontend
        return res.status(200).json({
            message: "user fetched",
            user: user
        });
    } catch (error) {
        next(error)
    }

});


export const updateUserProfile = asyncHandler(async (req, res, next) => {
    try {
        const userId = req.user._id;
        const { displayName, selectedColor } = req.body;
        if (!displayName || selectedColor === undefined) {
            return next(new ApiError(400, "Name And color  is Required"));
        }

        if (!/^[A-Za-z ]+$/.test(displayName)) {
            return next(new ApiError(400, "Name should not contain any numbers or special characters"));
        }



        const updatedUser = await User.findByIdAndUpdate(
            userId,
            {
                displayName: displayName,
                color: selectedColor,
                profileSetup: true
            },
            {
                new: true,
                runValidators: true
            }
        ).select('-password');
        console.log(updatedUser);


        return res.status(200).json({
            message: "User Profile Updated",
            user: updatedUser
        });

    } catch (error) {
        next(error)
    }
});

// optimize this code 
export const uploadProfileImage = asyncHandler(async (req, res, next) => {
    try {
        const profileImageLocalPath = req.file?.path;
        const user = req.user
        if (!profileImageLocalPath) {
            return next(new ApiError(400, 'Profile Image is required'))
        }


        const profileImage = await uploadOnCloudinary(profileImageLocalPath);


        if (!profileImage.url) {
            return next(new ApiError(500, 'Could not upload The image please try again later '))
        }

        const updatedUser = await User.findByIdAndUpdate(
            user?._id,
            {
                $set: {
                    image: profileImage.url,
                },
            },
            { new: true }
        ).select("-password");


        return res.status(200).json({
            message: "User Profile Image Updated",
            user: updatedUser
        });

    } catch (error) {
        next(error)
    }
});

// optimize this code 
export const deleteProfileImage = asyncHandler(async (req, res, next) => {
    let deleteImageFromCloud
    try {
        const user = req.user;

        if (!user.image) {
            return next(new ApiError(400, 'Image not found to delete'))
        }

        deleteImageFromCloud = await deleteFromCloudinary(user.image)

        if (!deleteImageFromCloud) {
            return next(new ApiError(400, 'Could Not delete The Image Please Try Again Later'))
        }

        const updatedUser = await User.findByIdAndUpdate(
            user?._id,
            {
                $set: {
                    image: null,
                },
            },
            { new: true }
        ).select("-password");

        return res.status(200).json({
            message: "User Profile Image Updated",
            user: updatedUser
        });

    } catch (error) {
        console.log(error);
        next(error)
    }
})