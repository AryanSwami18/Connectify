import jwt from 'jsonwebtoken'
import { asyncHandler } from '../utils/asyncHandler.js'
import { ApiError } from '../utils/APIError.js';
import User from "../models/UserModel.js";

export const verifyToken = asyncHandler(async(req,res,next)=>{
    try {
        const token = req.cookies?.jwt|| req.header("Authorization")?.replace("Bearer ","");
    
        if (!token) {
           return next(new ApiError(400,"unauthorized Request"));
        }
    
        const decodedTokenInformation = await jwt.verify(token, process.env.JWT_KEY);
    
        const user = await User.findById(decodedTokenInformation?._id).select("-password ");
    
        if(!user){
            return next(new ApiError(400,"invalid token Request"));
        }
        req.user = user;
        next();
    } catch (error) {
        throw new ApiError(401,error?.message||"Invalid Access Request");
    }
    
});