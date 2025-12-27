import mongoose, { Schema } from 'mongoose'

const LEVELS = ['junior', 'middle', 'senior', 'lead']

const agentSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  level: {
    type: String,
    enum: LEVELS,
    required: true,
    lowercase: true,
    default: 'junior',
  },
  capacity: {
    type: Number,
    default: 5,
  },
})

export const Agent = mongoose.models.Agent || mongoose.model('Agent', agentSchema)
