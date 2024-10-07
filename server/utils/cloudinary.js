import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import { ApiError } from "./ApiError.js";
import dotenv from 'dotenv';


dotenv.config()
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure:true
});



const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) {
      return null;
    }
    //upload the file
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });
    //file has been uploaded succesfully
    fs.unlinkSync(localFilePath);
    return response;
  } catch (error) {
    // removes the file  from the server  as the operation have failed to upload the file
    fs.unlinkSync(localFilePath);
      console.log(error);
    
    return null;
  }
};


const deleteFromCloudinary = async(url)=>{

  try {
    const urlSplit = url.split("/");
    const imageNameWithExtension = urlSplit[7];
  
    const imageName = imageNameWithExtension.split(".")[0];
  
    cloudinary.uploader.destroy(imageName);
    return true
  } catch (error) {
    return false;
  }
};


export { uploadOnCloudinary,deleteFromCloudinary };