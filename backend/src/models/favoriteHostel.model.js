import mongoose ,{Schema} from "mongoose"

const favoriteHostelSchema = new Schema(
    {
        user:{
            type:Schema.Types.ObjectId,
            ref:'User',
            required:true,
            unique:true
        },
        hostels:[
            {
                type:Schema.Types.ObjectId,
                ref:'Hostel'
            }
        ]
    },
    {
        timestamps:true
    }
)

export const favoriteHostel = mongoose.model('favoriteHostel',favoriteHostelSchema)