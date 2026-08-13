import mongoose, {Schema} from "mongoose";
import mongooseAggregatorPaginate from "mongoose-aggregate-paginate-v2";

const hostelSchema = new Schema ({
        owner:{
            type:mongoose.Types.ObjectId,
            ref:'User',
            required:true
        },
        hostelName:{
            type:String,
            required:true,
            trim:true,
            index:true
        },
        location:{
            address:{
                type:String,
                required:true,
                trim: true
            },
            googleMapLink:{
                type:String,
                required:true,
                trim: true
            },
            state: {
                type: String,
                required: true,
                trim: true,
                index:true,
            },
            city: {
                type: String,
                required: true,
                trim: true,
                index:true
            },
            area: {
                type: String,
                required: true,
                trim: true,
                index:true
            }
        },
        rent: {
            type: Number,
            required: true,
            min: 0,
            index:true
        },
        type:{
            type:String,
            enum:['hostel', 'pg'],
            required:true,
            default:'hostel'
        },
        facilities:{
            wifi:{
                type:Boolean,
                default:false
            },
            ac:{
                type:Boolean,
                default:false
            },
            laundry:{
                type:Boolean,
                default:false
            },
            parking:{
                type:Boolean,
                default:false
            },
            food:{
                type:Boolean,
                default:false
            },
            hotWater:{
                type:Boolean,
                default:false
            },
            security:{
                type:Boolean,
                default:false
            }
        },
        photos: [
            {
                url: {
                    type: String,
                    required: true
                },
                publicId: {
                    type: String,
                    required: true
                }
            }
        ],
        allowedGenders:{
            type:[String],
            enum:['male', 'female', 'other'],
            required:true,
            minlength:1
        },
        verificationId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "VerifyDocument",
            required: true
        }
    },
    {
        timestamps:true
    }
)

hostelSchema.index({
    "location.state": 1,
    "location.city": 1,
    rent: 1
});

hostelSchema.plugin(mongooseAggregatorPaginate);
export const Hostel = mongoose.model('Hostel', hostelSchema)