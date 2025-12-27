import { NextResponse } from 'next/server'

import dbConnect from '@/lib/mongodb'
import { getUserIdFromRequest } from '@/lib/auth'

import { User } from '@/models/User'
import { Agent } from '@/models/Agent'
import { Ticket } from '@/models/Tickets'
import { Rating } from '@/models/Rating'

export const GET = async (req) => {
  await dbConnect()

  try {
    const userId = await getUserIdFromRequest(req)

    const agent = await Agent.findOne({ user: userId })
      .populate({
        path: 'user',
        select: '_id role',
      })
      .lean()

    if (!agent) {
      throw new Error('Agent not found!')
    }

    const { user } = agent
    const { role } = user

    if (role !== 'agent') {
      throw new Error('Invalid role!')
    }

    const [assignedTickets, ratingAgg, workload] = await Promise.all([
      Ticket.find({ agent: agent._id, isClose: { $ne: true } })
        .select('-messages')
        .lean(),
      Rating.aggregate([
        { $match: { agent: agent._id } },
        { $group: { _id: '$agent', avg: { $avg: '$score' }, count: { $sum: 1 } } },
        { $project: { _id: 0, avg: { $round: ['$avg', 1] }, count: 1 } },
      ]),
      Ticket.countDocuments({ agent: agent._id, isClose: { $ne: true } }),
    ])

    const ratingSummary = ratingAgg[0] ?? { avg: 0, count: 0 }

    return NextResponse.json(
      {
        status: 'ok',
        agent: {
          ...agent,
          assignedTickets,
          workload,
          rating: ratingSummary,
        },
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
