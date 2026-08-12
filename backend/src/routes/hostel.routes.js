import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js"
import { upload } from "../middlewares/multer.middleware.js"

import { createHostel,
        verifyHostel,
        getHostelById
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

//get hostelById

router.route("/:hostelId").get(verifyJWT, getHostelById)

export default router