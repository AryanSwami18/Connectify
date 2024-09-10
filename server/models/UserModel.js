import { genSalt, hash } from "bcrypt";
import mongoose from "mongoose";

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
    userName: {
        type: String,
        required: [true, "Username is required"],
        unique: true,
        minlength: [3, "Username must be at least 3 characters long"],
        maxlength: [30, "Username cannot exceed 30 characters"],
        match: [/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"]
    },
    displayName:{
        type:String,
        required:[true,"Your Name is Required"],
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
    const salt = genSalt();
    this.password = await hash(this.password,salt);
    next();
});


const User = mongoose.model("Users",userSchema);


export default User;