import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js"
import { upload } from "../middlewares/multer.middleware.js"
import { requestLoginOtp, userLogin } from "../controllers/user.controller.js";
import { userRegistration } from "../controllers/user.controller.js"

const router = Router()

router.route("/register").post(
    upload.single('photo'),
    userRegistration
)

router.post("/request-otp", requestLoginOtp);
//After otp submission user can login
router.post("/login", userLogin);

export default router
