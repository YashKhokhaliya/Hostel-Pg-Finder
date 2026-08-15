import Router from 'express'
import { verifyJWT } from '../middlewares/auth.middleware.js'
import { isStudent } from '../middlewares/student.middleware.js'
import {
    removeRating
} from "../controllers/rating.controller.js"

const router = new Router()

router.route('/:hostelId/remove-rating').delete(
    verifyJWT,
    isStudent,
    removeRating
)

export default router