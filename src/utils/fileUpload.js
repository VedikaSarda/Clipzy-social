import fs from "fs"
import {v2 as cloudinary} from "cloudinary";

cloudinary.config({ 
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
        api_key: process.env.CLOUDINARY_API_KEY, 
        api_secret: process.env.cloudinary12345678 // Click 'View API Keys' above to copy your API secret
    })

    const uploadFile = async (filePath) => {
    try {
        if(!filePath) return "No file path!"
      const response = await cloudinary.uploader.upload(filePath,{
        resource_type: "auto"
       }) 
       console.log("file Uploaded on Cloudinary Successfully!", response.url)
       return response.url
    } catch (error) {
        fs.unlinkSync(filePath) //remove the local file if upload fail
        return null
    }
    }

    export {uploadFile}