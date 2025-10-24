import { ApiError } from "../utils/apiErrorHandler";
import { asyncHandler } from "../utils/asynchandler";
import jwt from "jsonwebtoken";
import { User } from "../models/user.models";
export const verifyJWT = asyncHandler(async(req, res, next) => {
    try {
        const accessToken = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer" , "")
        if(!accessToken){
            throw new ApiError(401, "Unauthorized request")
        }
     const decodedInfo = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET)
     const user = await User.findById(decodedInfo._id).select("-password -refreshToken")
     if(!user){
        throw new ApiError(401, "Invalid Access Token")
     }
     req.user = user;
     next()
    } catch (error) {
        
        throw new ApiError(401, error?.message || "Invalid Access Token")
    }

})