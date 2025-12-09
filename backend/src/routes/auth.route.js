import express from "express";
import { signup, login, logout, updateProfile } from "../controllers/auth.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";
import { arcjetProtection } from "../middleware/arcjet.middleware.js";

const router = express.Router();

router.use(arcjetProtection);
// router.get("/test", arcjetProtection, (req,res) => {
//     res.status(200).json({message:"Test route"});
// });
router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout); // it is best practice to use post request in logout, because in get request it might get chached and does not make any sense.
router.put("/update-profile", protectRoute, updateProfile); // if a user wants to update his/her profile, then he/she should be authenticated for that protectRoute function is written, basically if a user is authenticated only then he/she can call updateProfile function. If not authenticated, it will throw some errors. // put for updating
router.get("/check", protectRoute, (req, res) => res.status(200).json(req.user)); // get for checking
// the authentication check is going to be our middleware.
export default router;