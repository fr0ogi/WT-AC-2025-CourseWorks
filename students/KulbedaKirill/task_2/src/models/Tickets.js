import mongoose, { Schema } from 'mongoose'

const messageSchema = new Schema(
  {
    from: {
      type: String,
      enum: ['user', 'agent'],
      required: true,
    },
    text: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    _id: false,
    timestamps: true,
  }
)

const ticketSchema = new Schema(
  {
    queue: {
      type: Schema.Types.ObjectId,
      ref: 'Queue',
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    agent: {
      type: Schema.Types.ObjectId,
      ref: 'Agent',
      required: false,
      default: null,
    },
    isClose: {
      type: Boolean,
      default: false,
    },
    messages: [messageSchema],
  },
  {
    timestamps: true,
  }
)

export const Ticket = mongoose.models.Ticket || mongoose.model('Ticket', ticketSchema)
