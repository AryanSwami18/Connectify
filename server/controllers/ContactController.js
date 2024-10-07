import User from '../models/UserModel.js'
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from '../utils/ApiError.js';
import mongoose from 'mongoose';
import Message from '../models/MessageModel.js';

export const searchContacts = asyncHandler(async (req, res, next) => {
    const { search } = req.body;

    // Input validation
    if (!search) {
        return next(new ApiError(400, 'Please provide a search term.'));
    }

    // Sanitize the search term (remove special characters)
    const sanitizedSearchTerm = search.replace(/[^a-zA-Z0-9 ]/g, '');

    // Create a case-insensitive regex to search for displayName or email
    const regex = new RegExp(sanitizedSearchTerm, 'i');

    // Search for users excluding the current user (_id !== req.user._id)
    const contacts = await User.find({
        $and: [
            { _id: { $ne: req.user._id } },
            { profileSetup: true },
            {
                $or: [
                    { displayName: regex },
                    { email: regex }
                ]
            }
        ]
    }).limit(20).select("-password  -profileSetup");

    // Return the found contacts
    res.status(200).json({
        message: 'Contacts fetched successfully',
        contacts,
    });
});


export const geContactsForMessageList = asyncHandler(async (req, res, next) => {
    try {
        let userId = req.user._id;
        userId = new mongoose.Types.ObjectId(userId);
        const contacts = await Message.aggregate([
            {
              $match: {
                $or: [
                  { sender: userId },
                  { receiver: userId }
                ]
              }
            },
            {
              $sort: { timestamp: -1 } // Sort by timestamp to get the latest messages
            },
            {
              $group: {
                _id: {
                  $cond: {
                    if: { $eq: ["$sender", userId] },
                    then: "$recipient",
                    else: "$sender"
                  }
                },
                latestMessageTime: { $first: "$timestamp" },
              }
            },
            {
              $lookup: {
                from: 'users', 
                localField: '_id',
                foreignField: '_id',
                as: 'contactInfo'
              }
            },
            {
              $unwind: {
                path: '$contactInfo',
              }
            },
            {
              $project: {
                _id: 1,
                latestMessageTime: 1,
                latestMessage: 1,
                email: "$contactInfo.email",
                displayName: "$contactInfo.displayName",
                image: "$contactInfo.image",
                color: "$contactInfo.color"
              }
            },
            {
              $sort: {
                latestMessageTime: -1 
              }
            }
          ]);
          
          console.log('Contacts:', contacts); 
          
        
        return res.status(200).json({
            message: 'user contacts fetched succesfully',
            contacts: contacts
        });
    } catch (error) {
        console.log(error);
    }
});


export const getAllContacts = asyncHandler(async(req,res,next)=>{
    
});
