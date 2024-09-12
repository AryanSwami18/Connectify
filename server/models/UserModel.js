import { genSalt, hash ,compare} from "bcrypt";
import mongoose from "mongoose";
import Jwt from "jsonwebtoken";
const userSchema = new mongoose.Schema({
    email:{
        type:String,
        required:[true,"Email is Required"],
        unique:true,
    },
    password:{
        type:String,
        required:[true,"Password is Required"],
    },
    displayName:{
        type:String,
        required:false,
    },
    image:{
        type:String,
        required:false
    },
    color:{
        type:Number,
        required:false,
    },
    profileSetup:{
        type:Boolean,
        default:false
    },

});


userSchema.pre("save",async function(next) {
    const salt = await genSalt();
    this.password = await hash(this.password,salt);
    next();
});


userSchema.methods.isPasswordCorrect = async function(password){
    return await  compare(password,this.password);
 }


 userSchema.methods.generateAccessToken = async function(){
    return Jwt.sign(
      {
        _id: this._id,
        email:this.email
      },
      process.env.JWT_KEY,
      {
        expiresIn: process.env.EXPIRY,
      }
    );
}

const User = mongoose.model("User",userSchema);


export default User;