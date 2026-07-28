import multer from "multer"
import crypto from "crypto"
import path from "path"

const storage = multer.diskStorage({
    destination: function(req,file,cb){
        cb(null, "./public/temp")
    },
    filename: function(req,file,cb){
        const uniqueName = crypto.randomUUID()
        const extension = path.extname(file.originalname).toLowerCase()

        cb(null, `${uniqueName}${extension}`)
    }
})

export const upload = multer({
    storage,
})