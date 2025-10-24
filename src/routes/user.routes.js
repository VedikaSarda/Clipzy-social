import { Router } from "express";
import { logoutuser,loginUser, resisterUser } from "../controllers/user.controller.js";
import {upload} from "../middlewares/multer.js"
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
router.route("/logout").post(verifyJWT,logoutuser)
export default router;