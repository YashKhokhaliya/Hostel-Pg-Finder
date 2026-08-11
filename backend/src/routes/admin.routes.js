import Router from 'express'
import { isAdmin } from '../middlewares/admin.middleware.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import {
    getRequest,
    getRequestById,
    updateStatus
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

router.route('/get-request/:verifyId/status').patch(
    verifyJWT,
    isAdmin,
    updateStatus
)

export default router