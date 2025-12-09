import express from "express";
import path from "path";
import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import { connectDB } from "./lib/db.js";
import { ENV } from "./lib/env.js";

const app = express();
const __dirname = path.resolve();

const PORT = ENV.PORT || 3000;
// we are adding a middleware so that we can get the details of the user sends
app.use(express.json()); // req.body
console.log(ENV.PORT)
app.use("/api/auth", authRoutes)
app.use("/api/message", messageRoutes)

// make ready for deployment
if(ENV.NODE_ENV === "production")
{
    app.use(express.static(path.join(__dirname, "..frontend/dist"))); // here we made the dist folder as static assets

    // everything other than api endpoints will be served as html files
    app.get("*", (req,res) => {
        res.sendFile(path.join(__dirname, "..frontend/dist/index.html"));
    });
}

app.listen(PORT, () => {
    console.log('Server is running on port: ' + PORT);
    connectDB();
})