import mongoose, { Schema } from 'mongoose'

const userSchema = new Schema({
  firstname: {
    required: true,
    type: String,
  },
  lastname: {
    required: true,
    type: String,
  },
  password: {
    required: true,
    type: String,
  },
  email: {
    required: true,
    type: String,
  },
  role: {
    required: true,
    type: String,
  },
})

export const User = mongoose.models.User || mongoose.model('User', userSchema)
