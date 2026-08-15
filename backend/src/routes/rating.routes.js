import Router from 'express'
import { verifyJWT } from '../middlewares/auth.middleware.js'
import { isStudent } from '../middlewares/student.middleware.js'
import {
    removeRating,
    addRating
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

export default router