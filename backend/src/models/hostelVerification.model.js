import mongoose, { Schema } from "mongoose";

const verifySchema = new Schema(
    {
        owner: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        city: {
            type: String,
            enum: ["ahmedabad", "vadodara", "surat", "rajkot"],
            required: true,
        },

        documentPublicId: {
            type: String,
            required: true,
        },

        documentResourceType:{
            type:String,
            required:true
        },

        documentType:{
            type:String,
            enum:['Property document', 'Property tax receipt', 'Lease agreement', 'Owner authorization / NOC'],
            required:true
        },

        status: {
            type: String,
            enum: ["pending", "accepted", "rejected"],
            default: "rending",
        },

        verifiedBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },

        used:{
            type:Boolean,
            default:false
        },

        rejectionReason: {
            type: String,
            default: null,
        },

        used: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true,
    }
);

verifySchema.index({
    city: 1,
    status: 1,
    createdAt: -1
})

export const VerifyDocument = mongoose.model(
    "VerifyDocument",
    verifySchema
);