import User from "../models/User.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../lib/utils.js";
import { sendWelcomeEmail } from "../emails/emailHandlers.js";
import { ENV } from "../lib/env.js";
import cloudinary from "../lib/cloudinary.js";

export const signup = async (req, res) => {
    const { fullName, email, password } = req.body;

    try {
        if (!fullName || !email || !password) {
            res.status(400).json({ message: "All fields are required" }); // bad request
        }

        if (password.length < 6) {
            res.status(400).json({ message: "The password has to be atleast 6 characters" });
        }

        // check if email is valid and for this we use regex (regular expression) checks
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email))
            return res.status(400).json({ message: "Invalid email format" });

        const user = await User.findOne({ email });
        if (user) {
            res.status(400).json({ message: "Email already exists" });
        }

        // 123456 => $laksdfl_powu41@lsakdj -> password hashing
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt); // hash this password with the salt you have

        const newUser = new User({
            fullName,
            email,
            password: hashedPassword
        });

        if (newUser) {
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
        else {
            res.status(400).json({ message: "Invalid user data" });
        }
    } catch (error) {
        console.log("Error in signup controller: ", error);
        res.status(500).json({ message: "Internal server error" });
    }
    // res.send("SignUp endpoint");
};

export const login = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
    }
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: "Invalid credentials" });
        // never tell the client which one is incorrect: password or email

        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) return res.status(400).json({ message: "Invalid credentials" });

        generateToken(user._id, res);

        res.status(200).json({
            _id: user._id,
            fullName: user.fullName,
            email: user.email,
            profilePic: user.profilePic,
        });
    } catch (error) {
        console.error("Error in login controller:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const logout = (req, res) => {
    res.cookie("jwt", "", { maxAge: 0 }); // jwt is written because we wrote the same in utils.js so both the strings must be same.
    res.status(200).json({ message: "Logged out successfully" });
};

export const updateProfile = async (req, res) => {
    try {
        const { profilePic } = req.body;
        if (!profilePic) return res.status(400).json({ message: "Profile pic is required" });

        const userId = req.user._id; // because in auth.middleware.js we made the next function to access the user as req.user

        const uploadResponse = await cloudinary.uploader.upload(profilePic);

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { profilePic: uploadResponse.secure_url },
            { new: true }
        );

        res.status(200).json(updatedUser);
    } catch (error) {
        console.log("Error in update profile:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};