import { ApiError } from "../utils/ApiError.js";
import { AsyncHandler } from "../utils/AsyncHandler.js";

const isOwner = AsyncHandler(async(req, _, next)=>{
    if(req.user.role!=='owner'){
        throw new ApiError(400,'Owner access required')
    }
    
    next()
})

export { isOwner }