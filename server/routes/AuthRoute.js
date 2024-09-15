import {Router} from 'express'
import { getUserInfo, login, signup ,updateUserProfile} from '../controllers/AuthController.js';
import { verifyToken } from '../middlewares/AuthMiddleware.js';
const authRoute = Router();

authRoute.post("/signup",signup);
authRoute.post("/login",login)
authRoute.get('/getUserInfo',verifyToken,getUserInfo)
authRoute.post('/updateProfile',verifyToken,updateUserProfile)
export default authRoute;
