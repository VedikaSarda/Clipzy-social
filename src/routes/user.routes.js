import { Router } from "express";
import { resisterUser } from "../controllers/user.controller.js";
import {upload} from "../middlewares/multer.js"
const router = Router()
router.route("/register").post(
    upload.fields([
     {
        name: "avatar",
        maxCount:1
     },
     {
        name:"coverImage",
        maxCount: 1
     },
    ]),
    resisterUser)

//router.route("/login").post(loginUser)
export default router;