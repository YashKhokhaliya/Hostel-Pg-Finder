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
    updateProfilePhoto,
    refreshAccessToken,
    forgetPasswordOtp,
    verifyOtpPasswordReset,
    resetPassword,
    getCurrentUser,
    deleteUSer
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

//refresh access-token
router.route("/refresh-tokens").post(refreshAccessToken)
router.route("/forget-password").post(forgetPasswordOtp)
router.route("/verify-otp").post(verifyOtpPasswordReset)
router.route("/reset-password").patch(resetPassword)
router.route("/current-user").get(verifyJWT,getCurrentUser)
router.route("/delete-user").delete(verifyJWT,deleteUSer)

export default router
