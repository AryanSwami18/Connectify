import { Router } from "express";
import { verifyToken } from "../middlewares/AuthMiddleware.js";
import { createGroup,getUserGroups,getGroupMessage } from "../controllers/GroupController.js";

const groupRoute = Router()

groupRoute.post('/createGroup',verifyToken,createGroup)
groupRoute.get('/getAllUserGroups',verifyToken,getUserGroups)
groupRoute.get('/getGroupMessages/:groupId',verifyToken,getGroupMessage)
export default groupRoute;