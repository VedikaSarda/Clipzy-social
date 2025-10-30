import { Router } from "express";
import { logoutUser,loginUser, resisterUser, refreshAccessToken } from "../controllers/user.controller.js";
import {upload} from "../middlewares/multer.middleware.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";
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

router.route("/login").post(loginUser)
router.route("/logout").post(verifyJWT,logoutUser)
router.route("/refreshToken").post(refreshAccessToken)

export default router;