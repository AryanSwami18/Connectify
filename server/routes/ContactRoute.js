import { Router } from "express";
import { verifyToken } from "../middlewares/AuthMiddleware.js";
import { searchContacts } from "../controllers/ContactController.js";

const contactRoute = Router()


contactRoute.post('/searchContacts',verifyToken,searchContacts);



export default contactRoute;