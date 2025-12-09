import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { ENV } from "../lib/env.js";

export const protectRoute = async (req, res, next) => { // next argument is written so that the next function (example: updateProfile) can run. 
  try {
    const token = req.cookies.jwt;
    if (!token) return res.status(401).json({ message: "Unauthorized - No token provided" });

    const decoded = jwt.verify(token, ENV.JWT_SECRET);
    if (!decoded) return res.status(401).json({ message: "Unauthorized - Invalid token" });

    const user = await User.findById(decoded.userId).select("-password"); // check if the user is in the database, select everything without the password.
    if (!user) return res.status(404).json({ message: "User not found" });

    req.user = user;
    next(); // call the next function
  } catch (error) {
    console.log("Error in protectRoute middleware:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};