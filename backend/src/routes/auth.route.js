import express from "express";
import { signup, login, logout } from "../controllers/auth.controller.js";

const router = express.Router();


router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout); // it is best practice to use post request in logout, because in get request it might get chached and does not make any sense.

export default router;