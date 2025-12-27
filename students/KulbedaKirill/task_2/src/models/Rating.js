import mongoose, { Schema, Types } from 'mongoose'

const RatingSchema = new Schema(
  {
    ticket: { type: Types.ObjectId, ref: 'Ticket', required: true },
    agent: { type: Types.ObjectId, ref: 'Agent', required: true },
    user: { type: Types.ObjectId, ref: 'User', required: true },
    score: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, maxlength: 500, default: '' },
  },
  { timestamps: true }
)

export const Rating = mongoose.models.Rating || mongoose.model('Rating', RatingSchema)
