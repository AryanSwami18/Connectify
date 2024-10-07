import { Router } from "express";
import { verifyToken } from "../middlewares/AuthMiddleware.js";
import { geContactsForMessageList, searchContacts } from "../controllers/ContactController.js";

const contactRoute = Router()


contactRoute.post('/searchContacts',verifyToken,searchContacts);
contactRoute.get('/getContactForMessages',verifyToken,geContactsForMessageList);


export default contactRoute;