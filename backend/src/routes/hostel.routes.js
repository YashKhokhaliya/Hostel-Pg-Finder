import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js"
import { upload } from "../middlewares/multer.middleware.js"

import { createHostel,
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

export default router