import mongoose, { Schema } from "mongoose";

const verifySchema = new Schema(
    {
        owner: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        area: {
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

export const VerifyDocument = mongoose.model(
    "VerifyDocument",
    verifySchema
);