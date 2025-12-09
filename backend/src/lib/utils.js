import jwt from "jsonwebtoken"; // allows us to implement authentication
// Authentication workflow
// user is going to click a button which is going to send a request to our endpoint which is like /api/auth/signup or api/auth/login
// if its the signup case, then we would create and save a user in the database and then generate a token (its says the user, "Hey you are authenticated, just save this token with you")
// We have created the token in the server and send it back to the client, that's why we passed the response as the argument
// we will create the token and send it back in cookies to the client and show success message on successful signup or login.
export const generateToken = (userId, res) => {
    const token = jwt.sign({userId},process.env.JWT_SECRET,{
        expiresIn:"7d",
    }); // it says which token is used by which user
    res.cookie("jwt", token, {
        maxAge: 7*24*60*60*1000, // in milliseconds
        httpOnly: true, // this will prevent XSS attacks -> this means this token will be available via http only -- cross site scripting
        sameSite: "strict", // this will prevent CSRF attacks
        secure: process.env.NODE_ENV === "production" ? true : false,
    });

    return token;
};

// if we are in development then we use http://localhost
// but if we are in production then we use https://somedomain.com -> the 's' in https refers secure