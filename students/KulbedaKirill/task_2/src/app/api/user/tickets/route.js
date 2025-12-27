import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'

import { createTicket } from '@/queries/tickets'
import { getUserIdFromRequest } from '@/lib/auth'
import { Ticket } from '@/models/Tickets'

export const GET = async (req) => {
  await dbConnect()

  try {
    const userId = await getUserIdFromRequest(req)

    const tickets = await Ticket.find({ user: userId }).populate('queue').lean()

    return NextResponse.json(
      {
        status: 'ok',
        tickets,
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

export const POST = async (req) => {
  const { title, queue, message } = await req.json()

  await dbConnect()

  try {
    const userId = await getUserIdFromRequest(req)

    const ticket = await createTicket({ title, queue, message, user: userId })
    const populatedTicket = await Ticket.findById(ticket._id).populate('queue')

    return NextResponse.json(
      {
        status: 'ok',
        ticket: populatedTicket,
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
