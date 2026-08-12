import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js"
import { upload } from "../middlewares/multer.middleware.js"

import {
    createHostel,
    getAllHostel,
    verifyHostel
} from "../controllers/hostel.controller.js";

const router = Router()

router.route("/create-hostel/:verificationId").post(
    verifyJWT,
    upload.array("photos", 8),
    createHostel
);

router.route("/verify-hostel").post(
    verifyJWT,
    upload.single("document"),
    verifyHostel
)

router.route("/get-all-hostel").get(
    verifyJWT,
    getAllHostel
)

export default router