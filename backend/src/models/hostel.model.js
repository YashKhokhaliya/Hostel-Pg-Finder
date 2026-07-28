import mongoose, {Schema} from "mongoose";

const hostelSchema = new Schema ({
        owner:{
            type:mongoose.Types.ObjectId,
            ref:'User',
            required:true
        },
        hostelName:{
            type:String,
            required:true,
            trim:true
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
            }
        },
        rent: {
            type: Number,
            required: true,
            min: 0
        },
        type:{
            type:String,
            enum:['Hostel', 'PG'],
            required:true,
            default:'Hostel'
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
            enum:['Male', 'Female', 'Other'],
            required:true,
            minlength:1
        }
    },
    {
        timestamps:true
    }
)

export const Hostel = mongoose.model('Hostel', hostelSchema)