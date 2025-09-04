import { asyncHandler } from "../utils/asynchandler.js";
import { ApiError } from "../utils/apiErrorHandler.js";
import  {User} from "../models/user.models.js";
import { uploadFile } from "../utils/fileUpload.js";
import { ApiResponse } from "../utils/apiResponse.js";
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
    new ApiResponse(200, createdUser,"User Registered Sucessfully")
)

}) 
export {resisterUser}