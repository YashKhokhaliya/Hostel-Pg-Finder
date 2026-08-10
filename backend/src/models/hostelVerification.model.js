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
            enum: ["Ahmedabad", "Vadodara", "Surat", "Rajkot"],
            required: true,
        },

        document: {
            type: String,
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
            enum: ["Pending", "Accepted", "Rejected"],
            default: "Pending",
        },

        verifiedBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },

        rejectionReason: {
            type: String,
            default: null,
        },
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