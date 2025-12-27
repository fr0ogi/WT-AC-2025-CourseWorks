import mongoose, { Schema } from 'mongoose'

const queueSchema = new Schema({
  title: {
    required: true,
    type: String,
  },
})

export const Queue = mongoose.models.Queue || mongoose.model('Queue', queueSchema)
