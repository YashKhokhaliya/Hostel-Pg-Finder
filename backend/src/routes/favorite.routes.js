import { Router } from "express";
import { isStudent } from "../middlewares/student.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { addHostel } from "../controllers/favorite.controller.js";

const router = Router()

router.route('/:hostelId/add-to-list').patch(
    verifyJWT,
    isStudent,
    addHostel
)

export default router