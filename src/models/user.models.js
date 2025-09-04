import mongoose ,{Schema} from "mongoose";
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt";
const userSchema = new Schema({
username:{
    type: String,
    required:true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true //serachable in optimized way
},
email:{
   type: String,
    required:true,
    unique: true,  
    lowercase: true,
    trim: true
},
fullname:{
    type: String,
    required:true, 
    index: true,
    trim: true 
},
avatar: {
    type: String, //cloudinary url
},
coverImage:{
   type: String,
   required: true, 
},
watchhistory:[
    { 
    type: Schema.Types.ObjectId,
    ref: "Video"
    }
] ,

password : {
    type: String,
    required: [true, "Password is required"]
},
refreshToken: {
    type: String,

}

},{timestamps: true})

userSchema.pre("Save", async function (next) {
    if(this.isModified("password")) { 
     this.password = await bcrypt.hash(this.password, 12)
     next()
    }
     return next()
})

userSchema.methods.isPasswordCorrect = async function (password){
return await bcrypt.compare(password, this.password) // return boolen value
}

userSchema.methods.generateAccessToken =  async function (){
jwt.sign(
    {
        _id: this.id,
        email: this.email,
        usename: this.username,
        fullname:this.fullname  
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRY
    }
)}

userSchema.methods.refreshAccessToken =  async function (){
    jwt.sign(
    {
        _id: this.id,
        email: this.email, 
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRY
    }
)
}
export const User = mongoose.model("User", userSchema)