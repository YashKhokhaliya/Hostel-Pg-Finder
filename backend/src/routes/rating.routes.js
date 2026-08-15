import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js"
import { isOwner } from "../middlewares/owner.middleware.js";

import { 
    addRating

} from "../controllers/rating.controller.js";

const router = Router()

router.route('/add-rating/:hostelId').post(
    verifyJWT,
    addRating
)

export default router