import { NextResponse } from 'next/server'

import dbConnect from '@/lib/mongodb'
import { getUserIdFromRequest } from '@/lib/auth'
import { claimTicket } from '@/queries/tickets'

import { User } from '@/models/User'
import { Agent } from '@/models/Agent'
import { Rating } from '@/models/Rating'

import { publishEvent } from '@/lib/publishEvent'
import { Ticket } from '@/models/Tickets'

export const POST = async (req, context) => {
  const { id } = await context.params

  await dbConnect()

  try {
    const userId = await getUserIdFromRequest(req)

    const { role } = await User.findById(userId).select('role')

    if (role !== 'agent') {
      throw new Error('Invalid role')
    }

    const agent = await Agent.findOne({ user: userId }).populate({
      path: 'user',
      select: 'firstname lastname role email',
    })

    if (!agent) {
      throw new Error('No agent found!')
    }

    const workload = await Ticket.countDocuments({ agent: agent._id, isClose: { $ne: true } })

    if (workload >= agent.capacity) {
      throw new Error(`You cannot take more than ${agent.capacity} tickets.`)
    }

    const ticket = await claimTicket({
      ticketId: id,
      agent: agent._id,
    })

    const agentRating = await Rating.aggregate([
      { $match: { agent: agent._id } },
      { $group: { _id: '$agent', avg: { $avg: '$score' }, count: { $sum: 1 } } },
      { $project: { _id: 0, avg: { $round: ['$avg', 1] }, count: 1 } },
    ])

    publishEvent(id, 'claim', {
      agent,
      agentRating,
    })

    return NextResponse.json(
      {
        status: 'ok',
        ticket,
      },
      {
        status: 201,
      }
    )
  } catch (error) {
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
