import { Router } from "express";
import verifyJWT from "../middlewares/auth.middleware.js"
import upload from "../middlewares/multer.middleware.js"

import { userRegistration } from "../controllers/user.controller.js"

const router = Router()

router.route("/register").post(
    upload.single('avatar'),
    userRegistration
)