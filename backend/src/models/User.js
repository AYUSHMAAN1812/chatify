import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
    },
    fullName: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
        minlength: 6,
    },
    profilePic: {
        type: String,
        default: "",
    }
}, { timestamps: true }); // user created at and updated at (like last login)

const User = mongoose.model("User", userSchema); // this says create a user model based on this userSchema

export default User;