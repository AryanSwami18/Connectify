import {Router} from 'express'
import { deleteProfileImage, getUserInfo, login, logout, signup ,updateUserProfile,uploadProfileImage} from '../controllers/AuthController.js';
import { verifyToken } from '../middlewares/AuthMiddleware.js';
import { upload } from '../middlewares/MulterMiddleware.js';
const authRoute = Router();

authRoute.post("/signup",signup);
authRoute.post("/login",login)
authRoute.get('/getUserInfo',verifyToken,getUserInfo)
authRoute.post('/updateProfile',verifyToken,updateUserProfile)
authRoute.post('/uploadProfilePicture',verifyToken,upload.single("profileImage"),uploadProfileImage)
authRoute.post('/deleteProfileImage',verifyToken,deleteProfileImage)
authRoute.post('/logout',verifyToken,logout)
export default authRoute;
