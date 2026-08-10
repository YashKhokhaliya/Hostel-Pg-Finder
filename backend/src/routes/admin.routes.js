import Router from 'express'
import { isAdmin } from '../middlewares/admin.middleware.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import {
    getRequest,
    getRequestById
} from '../controllers/admin.controller.js'
import { VerifyDocument } from '../models/hostelVerification.model.js';

const router = Router();

router.route('/get-request').get(
    verifyJWT,
    isAdmin,
    getRequest
);

router.route('/get-request/:verifyId').get(
    verifyJWT,
    isAdmin,
    getRequestById
)

export default router