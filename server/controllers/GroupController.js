import mongoose from "mongoose";
import Group from "../models/GroupModel.js";
import User from "../models/UserModel.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import Message from '../models/MessageModel.js'
export const createGroup = asyncHandler(async(req,res,next)=>{
    try {
        const {name, members} = req.body;
    
        const userId = req.user._id;
        const admin = await User.findById(userId);
    
        if (!admin) {
            return next(new ApiError(400, 'Admin user does not exist'));
        }
    
        if (!name || members.length === 0) {
            return next(new ApiError(400, 'Group name and members are required'));
        }
    
        const validMembers = await User.find({_id: {$in: members}});
    
        if (validMembers.length !== members.length) {
            return next(new ApiError(400, 'Invalid members'));
        }
    
        const newGroup = new Group({
            name,
            members,
            admin: userId
        });
    
        await newGroup.save();
    
        return res.status(200).json({
            message: 'New Group Created',
            group: newGroup
        });
    } catch (error) {
        console.log(error);
    }
});


export const getUserGroups = asyncHandler(async(req,res,next)=>{
    try {
        let userId = req.user._id;
        userId  = new mongoose.Types.ObjectId(userId)
        const groups = await Group.find({
            $or: [
                {admin: userId},
                {members: userId}
                ]
        })


        return res.status(200).json({
            message: 'Groups Retrieved',
            groups: groups
        })
    } catch (error) {
        console.log(error);
    }
});


export const getGroupMessage =asyncHandler(async(req,res,next)=>{
    try {
        const  groupId = req.params.groupId;
        if(!groupId){
            return next(new ApiError(400, 'Invalid Group Id'))
        }

        const messages = await Message.find({group: groupId}).sort({createdAt: -1}).populate('sender')

        return res.status(200).json({
            message:'fetched',
            messages:messages
        })

    } catch (error) {
        console.log(error);
    }
});