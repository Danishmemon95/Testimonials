import mongoose from "mongoose";

const { Schema } = mongoose;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const testimonialSchema = new Schema(
    {
        name: {
            type: String,
            required: [true, "Name is required"],
            trim: true,
            maxlength: 120,
        },
        email: {
            type: String,
            required: [true, "Email is required"],
            trim: true,
            lowercase: true,
            match: [EMAIL_RE, "Email is not valid"],
        },
        company: {
            type: String,
            trim: true,
            maxlength: 160,
            default: "",
        },
        text: {
            type: String,
            required: [true, "Testimonial text is required"],
            trim: true,
            minlength: 10,
            maxlength: 2000,
        },
        rating: {
            type: Number,
            required: [true, "Star rating is required"],
            min: 1,
            max: 5,
        },
        photoUrl: {
            type: String,
            trim: true,
            default: "",
        },
        status: {
            type: String,
            enum: ["pending", "approved", "rejected"],
            default: "pending",
            index: true,
        },
    },
    { timestamps: true }
);

export const Testimonial = mongoose.model("Testimonial", testimonialSchema);