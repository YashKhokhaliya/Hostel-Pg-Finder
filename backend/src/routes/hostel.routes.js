import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js"
import { upload } from "../middlewares/multer.middleware.js"
import { isOwner } from "../middlewares/owner.middleware.js";

import {
    createHostel,
    getAllHostel,
    verifyHostel,
    getHostelById,
    getMyHostels,
    deleteHostel,
    updateHostel,
    addHostelPhotos,
    deleteHostelPhotos
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

//get Owner hostels
router.route("/get-my-hostel").get(
    verifyJWT,
    getMyHostels
)

//get hostelById
router.route("/:hostelId").get(verifyJWT, getHostelById)

router.route("/get-all-hostel").get(
    verifyJWT,
    getAllHostel
)

//delete hostel
router.route("/delete-hostel/:hostelId").delete(
    verifyJWT,
    deleteHostel
)
router.route('/update-hostel').patch(
    verifyJWT,
    isOwner,
    updateHostel
)

router.route('/add-hostel-photos/:hostelId').patch(
    verifyJWT,
    isOwner,
    upload.array("photos", 8),
    addHostelPhotos
)

router.route('/delete-hostel-photos/:hostelId').delete(
    verifyJWT,
    isOwner,
    deleteHostelPhotos
)

export default router