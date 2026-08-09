import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js"
import { upload } from "../middlewares/multer.middleware.js"

import { createHostel } from "../controllers/hostel.controller.js";

const router = Router()

router.route("/create-hostel").post(
    verifyJWT,
    upload.array("photos", 8),
    createHostel
);


export default router