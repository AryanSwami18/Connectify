import User from '../models/UserModel.js'
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from '../utils/ApiError.js';

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
            {profileSetup:true},
            {
                $or: [
                    { displayName: regex },
                    { email: regex }
                ]
            }
        ]
    }).limit(20).select("-password  -profileSetup"); // Optional: Limit the number of contacts returned

    // Return the found contacts
    res.status(200).json({
        message: 'Contacts fetched successfully',
        contacts,
    });
});
