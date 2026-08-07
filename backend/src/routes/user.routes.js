import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js"
import { upload } from "../middlewares/multer.middleware.js"
import { 
    requestLoginOtp,
    userLogin,
    userRegistration,
    userLogout
} from "../controllers/user.controller.js";

const router = Router()

router.route("/register").post(
    upload.single('photo'),
    userRegistration
)

router.route("/request-otp").post(requestLoginOtp);
//After otp submission user can login
router.route("/login").post(userLogin);
router.route("/logout").post(verifyJWT, userLogout);

export default router
