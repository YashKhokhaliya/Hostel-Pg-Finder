import mongoose, {Schema} from "mongoose"

const ratingSchema = new Schema(
    {
        user: {
            type: mongoose.Types.ObjectId,
            ref: 'User',
            required: true
        },
        hostel: {
            type: mongoose.Types.ObjectId,
            ref: 'Hostel',
            required: true
        },
        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5
        },
        comment:{
            type:String,
            trim:true,
            maxLength:500
        }
    },
    {timestamps: true}
)

ratingSchema.index(
    {user: 1, hostel: 1},
    {unique: true}
)

export const Rating = mongoose.model('Rating', ratingSchema)