
import { ApiError } from "../utils/APIError.js";

const errorMiddleware = (err, req, res, next) => {
    if (err instanceof ApiError) {
        return res.status(err.statusCode).json({
            success: err.success,
            message: err.message,
            errors: err.errors
        });
    }
    // For unexpected errors
    return res.status(500).json({
        success: false,
        message: "An unexpected error occurred",
        errors: []
    });
};

export default errorMiddleware;
