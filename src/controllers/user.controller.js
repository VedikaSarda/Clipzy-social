import { asyncHandler } from "../utils/asynchandler.js";
import { ApiError } from "../utils/apiErrorHandler.js";
import  {User} from "../models/user.models.js";
import { uploadFile } from "../utils/fileUpload.js";
import { ApiResponse } from "../utils/apiResponse.js";
import jwt from "jsonwebtoken";
const resisterUser = asyncHandler(async (req, res) => {
    //get data from frontend 
    const {username, fullname, email, password} = req.body
    console.log("email:", email)


    //Validation
    if([fullname, username, email, password].some((field) => field?.trim() === "")){
        throw new ApiError( 400, "All fields are reguired")
    }


    //Check is user alredy exists
     const existedUser = await User.findOne({ $or : [{username}, {email}]})
     if(existedUser){
        throw new ApiError(409, "User with email or username alredy exists")
     }
      console.log(req.files)
     //fileuploads
     const avatarLocalPath = req.files?.avatar?.[0]?.path;
    const coverImageLocalPath = req.files?.coverImage?.[0]?.path;
    console.log(avatarLocalPath)

    // let coverImageLocalPath;
    // if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
    //     coverImageLocalPath = req.files.coverImage[0].path
    // }
    

    if (!avatarLocalPath) {
        throw new ApiError(400, "avatar file is required")
    }

    const avatar = await uploadFile(avatarLocalPath)
    const coverImage = await uploadFile(coverImageLocalPath)
    console.log(avatar.url)
    //console.log(coverImage.url)

    if (!avatar) {
        throw new ApiError(400, "Avatar file is required")
    }
   
    const user = await User.create({
        fullname,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email, 
        password,
        username: username.toLowerCase()
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
  if(!(username || email)){
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

const refreshAccessToken = asyncHandler(async(req, res) => {
    const incomingrefreshToken = req.cookies.refreshToken || req.body.refreshToken
    if(!incomingrefreshToken){
        throw new ApiError( 401, "Unauthorized request")
    }
   try {
    const decodedToken = jwt.verify(incomingrefreshToken, process.env.REFRESH_TOKEN_SECRET)
    const user = await User.findById(decodedToken?._id)
    if(!user){
     throw new ApiError(401, "Invalid refresh Token")
    }
    if(incomingrefreshToken !== user?.refreshToken){
     throw new ApiError(401, "Refresh Token is expired or used")
    }
 const options = {
     httpOnly: true,
     secure: true,
 }
 const {accessToken, newrefreshToken} = await generateAccessTokenAndRefreshToken(user._id)
 return res
 .status(200)
 .cookie("accessToken", accessToken)
 .cookie("refreshToken", newrefreshToken)
 .json(
     new ApiResponse(
         200,
         {accessToken,
        refreshToken: newrefreshToken,},
        "Access Token Refreshed Successfully"
 
     )
 )
   } catch (error) {
    throw new ApiError(401, error.message|| "Invalid refresh Token")
   }
})
export {
    resisterUser,
    loginUser,
    logoutUser,
    refreshAccessToken
}