import { asyncHandler } from "../utils/asynchandler.js";
import { ApiError } from "../utils/apiErrorHandler.js";
import  {User} from "../models/user.models.js";
import { uploadFile } from "../utils/fileUpload.js";
import { ApiResponse } from "../utils/apiResponse.js";
import jwt from "jsonwebtoken"
import mongoose from "mongoose";

const resisterUser = asyncHandler(async (req, res) => {
    //get data from frontend 
    const {username, fullname, email, password} = req.body
    console.log("email:", email)


    //Validation
    if([fullname, username, email, password].some((field) => field?.trim === "")){
        throw new ApiError( 400, "All fields are reguired")
    }


    //Check is user alredy exists
     const existedUser = User.findOne({ $or : [{username}, {email}]})
     if(existedUser){
        ApiError(409, "User with email or username alredy exists")
     }

     //fileuploads
     const avatarLocalPath = req.files?.avatar[0]?.path
     const coverImageLocalPath = req.files?.coverImage[0].path
     if(!coverImageLocalPath){
        throw new ApiError(400, "Cover image is reguired")
     }
   const avatar = await  uploadFile(coverImageLocalPath)
   const coverImage = await uploadFile(avatarLocalPath)

   if(!coverImage){
   throw new ApiError(400, "Cover image is reguired")
   }
 
   const user = await User.create({
    fullname,
    avatar: avatar?.url || "",
    coverImage: coverImage.url,
    username : username.toLowerCase(),
    email,
    password
 })

const createdUser = await User.findById(user._id).select(
    "-password -refreshToken" //these field not be selected
 )
 
if(!createdUser){
    throw new ApiError(500, "Internal Server Error: Something went wrong while registering a user")
}

return res.status(201).json(
    new ApiResponse(200, createdUser, "User registered Successfully")
)

}) 

const generateAccessTokenAndRefreshToken  =  async(userId) => {
    try {
        const user = await User.findById(userId)
       const accessToken = user.generateAccessToken()
       const refreshToken = user.refreshAccessToken()
        user.refreshToken = refreshToken
        await user.save({validateBeforeSave : false})
       return {
        accessToken,
        refreshToken
       }
        
    } catch (error) {
        throw new ApiError(500, "Somthing went wrong while gennerating access or refresh token")
    }
}


const loginUser = asyncHandler(async (req, res) => {
  // take password, email or user name from req.body
  const {username, email, password} = req.body
  if(!username && !email){
    throw new ApiError( 400, "Username or Email Required")
  }

  // check if user exist with the given email or password
   const user = await User.findOne({ 
    $or:[{email},
         {username}
        ]})

  // if do not exists
  // throw error : user should be regiseted
   if(!user){
            throw new ApiError(404, "User does not exists")
        }
  // if exist then login check password
       const isPasswordValid = await user.isPasswordCorrect(password)
       if(!isPasswordValid){
            throw new ApiError(401, "Invalid User Password")
        }
    
// generate accesstoken and refresh token and 
const {accessToken, refreshToken} = await generateAccessTokenAndRefreshToken(user._id)
// send to user through cookies
 
const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken")
const options = {
    httpOnly: true,
    secure: true
}
 
//response
return res.status(200)
.cookie("accessToken", accessToken, options)
.cookie("refreshToken", refreshToken, options)
.json(
    new ApiResponse(200, {
        user: loggedInUser, accessToken, refreshToken
    },
"User Logged in Successfully"
)
)
 
})

const logoutUser = asyncHandler(async(req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                refreshToken: 1 // this removes the field from document
            }
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged Out"))
})
export {
    resisterUser,
    loginUser,
    logoutUser
}