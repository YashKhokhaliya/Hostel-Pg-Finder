import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js"
import { upload } from "../middlewares/multer.middleware.js"
import { 
    requestLoginOtp,
    userLogin,
    userRegistration,
    userLogout,
    userProfilePhotoDelete,
    updatePassword,
    updateProfilePhoto
} from "../controllers/user.controller.js";

const router = Router()

router.route("/register").post(
    upload.single('photo'),
    userRegistration
)

router.route("/request-otp").post(requestLoginOtp);
//After otp submission user can login
router.route("/login").post(userLogin);
// logout 
router.route("/logout").post(verifyJWT, userLogout);
// remove profile photo
router.route('/remove-profile-photo').delete(verifyJWT, userProfilePhotoDelete)

//update Password
router.route("/update-password").patch(verifyJWT, updatePassword)

//update profile-photo
router.route("/profile-photo").patch(verifyJWT, upload.single('profilePhoto'), updateProfilePhoto)

export default router
