import { ApiError } from "../utils/ApiError.js";
import { AsyncHandler } from "../utils/AsyncHandler.js";

const isAdmin = AsyncHandler( async(req, _, next)=>{
    if(req.user?.role!=='admin'){
        throw new ApiError(403,'Admin access required')
    }

    next();
})

export {isAdmin}