import { NextResponse } from 'next/server'

import dbConnect from '@/lib/mongodb'
import { getUserIdFromRequest } from '@/lib/auth'
import { closeTicket } from '@/queries/tickets'
import { User } from '@/models/User'
import { Agent } from '@/models/Agent'
import { publishEvent } from '@/lib/publishEvent'

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

    const ticket = await closeTicket({
      ticketId: id,
    })

    publishEvent(id, 'close', {
      agent,
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
