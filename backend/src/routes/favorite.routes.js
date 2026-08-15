import { Router } from "express";
import { isStudent } from "../middlewares/student.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
    addHostel,
    getMyFavoriteHostels,
    removeHostel
} from "../controllers/favorite.controller.js";

const router = Router()

router.route('/:hostelId/add-to-list').patch(
    verifyJWT,
    isStudent,
    addHostel
)

router.route('/:hostelId/remove-from-list').delete(
    verifyJWT,
    isStudent,
    removeHostel
)

router.route('/get-all-favorite-hostels').get(
    verifyJWT,
    isStudent,
    getMyFavoriteHostels
)

export default router