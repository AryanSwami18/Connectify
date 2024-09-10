import User from "../models/UserModel";

export const signup = async(req,res,next)=>{
    try {
        const {email,password} = req.body;

        if(!email || !password){
            return res.status(400).send("Email And Password is Required");
        }

        const user = await User.create({email,password});
    } catch (error) {
        console.log();
        
    }
};