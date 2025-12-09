import User from "../models/User.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../lib/utils.js";
import { sendWelcomeEmail } from "../emails/emailHandlers.js";
import { ENV } from "../lib/env.js";

export const signup = async (req,res) => {
    const {fullName, email, password} = req.body;

    try {
        if(!fullName || !email || !password){
            res.status(400).json({message : "All fields are required"}); // bad request
        }

        if(password.length < 6){
            res.status(400).json({message: "The password has to be atleast 6 characters"});
        }

        // check if email is valid and for this we use regex (regular expression) checks
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if(!emailRegex.test(email))
            return res.status(400).json({message: "Invalid email format"});

        const user = await User.findOne({email});
        if(user)
        {
            res.status(400).json({message:"Email already exists"});
        }

        // 123456 => $laksdfl_powu41@lsakdj -> password hashing
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt); // hash this password with the salt you have

        const newUser = new User({
            fullName,
            email,
            password: hashedPassword
        });

        if(newUser)
        {
            // Persist user first, and then issue auth cookie
            const savedUser = await newUser.save();
            generateToken(savedUser._id, res);
            
            // await newUser.save();
            // we send this response back to the user to tell that he/she successfully signed up.
            res.status(201).json({
                _id: newUser._id,
                fullName: newUser.fullName,
                email: newUser.email,
                profilePic: newUser.profilePic,
            }); // status = 200 means success and 201 means something created successfully

            
            try {
                await sendWelcomeEmail(savedUser.email, savedUser.fullName, ENV.CLIENT_URL);
            } catch (error) {
                console.error("Failed to send welcome email: ", error);
            }
        }
        else
        {
            res.status(400).json({message: "Invalid user data"});
        }
    } catch (error) {
        console.log("Error in signup controller: ", error);
        res.status(500).json({message: "Internal server error"});
    }
    // res.send("SignUp endpoint");
};

