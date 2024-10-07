import Message from "../models/MessageModel.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getMessages = asyncHandler(async(req,res,next)=>{
    try {
        const user1 = req.user._id
        const user2 = req.body.id

        
    
        if(!user1 || !user2){
            return next(new ApiError(400,'both user id are required'));
        }
    
        const messages = await Message.find({
            $or: [
                {sender:user1,recipient:user2},
                {sender:user2,recipient:user1}
            ]
        }).sort({timestamp:1})
    
    
        res.status(200).json({
            message:'all message fetched',
            messages:messages
        });
    } catch (error) {
        console.log(error);
    }
});