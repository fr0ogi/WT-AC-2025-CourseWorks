import mongoose from 'mongoose'
import { NextResponse } from 'next/server'

import dbConnect from '@/lib/mongodb'
import { getUserIdFromRequest } from '@/lib/auth'
import { Ticket } from '@/models/Tickets'
import { User } from '@/models/User'
import { Rating } from '@/models/Rating'
import '@/models/Agent'

export const GET = async (req, context) => {
  const { id } = await context.params

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ status: 'error', message: 'Invalid id' }, { status: 400 })
  }

  await dbConnect()

  try {
    const userId = await getUserIdFromRequest(req)

    const { role } = (await User.findById(userId).select('role').lean()) ?? {}

    const ticket = await Ticket.findById(id)
      .populate([
        { path: 'user', select: '_id firstname lastname email role' },
        {
          path: 'agent',
          select: '_id user level',
          populate: {
            path: 'user',
            select: '_id firstname lastname email role',
          },
        },
      ])
      .lean()

    if (!ticket) {
      return NextResponse.json({ status: 'error', message: 'Not found' }, { status: 404 })
    }

    const isOwner = ticket.user?._id.equals?.(userId) ?? false
    const isAssignedAgent = ticket.agent?.user?._id?.equals?.(userId) ?? false
    const isAdmin = role === 'admin'

    if (!isOwner && !isAssignedAgent && !isAdmin) {
      return NextResponse.json({ status: 'error', message: 'Not found' }, { status: 404 })
    }

    let agentRating = null

    if (ticket.agent) {
      agentRating = await Rating.aggregate([
        { $match: { agent: ticket.agent._id } },
        { $group: { _id: '$agent', avg: { $avg: '$score' }, count: { $sum: 1 } } },
        { $project: { _id: 0, avg: { $round: ['$avg', 1] }, count: 1 } },
      ])
    }

    return NextResponse.json(
      {
        status: 'ok',
        ticket: { ...ticket, agentRating },
      },
      {
        status: 201,
      }
    )
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      {
        status: 'error',
        message: error.message,
      },
      {
        status: 500,
      }
    )
  }
}
