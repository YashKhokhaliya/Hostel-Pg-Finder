import Router from 'express'
import { verifyJWT } from '../middlewares/auth.middleware.js'
import { isStudent } from '../middlewares/student.middleware.js'
import {
    removeRating,
    addRating,
    updateRating,
    getHostelRatings
} from "../controllers/rating.controller.js"

const router = new Router()

router.route('/:hostelId/remove-rating').delete(
    verifyJWT,
    isStudent,
    removeRating
)

router.route('/add-rating/:hostelId').post(
    verifyJWT,
    isStudent,
    addRating
)

router.route('/update-rating/:ratingId').patch(
    verifyJWT,
    isStudent,
    updateRating
)

router.route('/get-hostel-ratings/:hostelId').get(
    verifyJWT,
    getHostelRatings
)

export default router