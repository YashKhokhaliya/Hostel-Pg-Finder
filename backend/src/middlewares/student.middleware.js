import { ApiError } from "../utils/ApiError.js";
import { AsyncHandler } from "../utils/AsyncHandler.js";

const isStudent = AsyncHandler(async(req,_,next)=>{
    if(req.user?.role !=='student'){
        throw new ApiError(403,'Student access required')
    }

    next()
})

export { isStudent }