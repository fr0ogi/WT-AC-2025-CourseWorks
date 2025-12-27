import { NextResponse } from 'next/server'

import dbConnect from '@/lib/mongodb'
import { getUserIdFromRequest } from '@/lib/auth'
import { User } from '@/models/User'
import { addMessage } from '@/queries/tickets'
import { Ticket } from '@/models/Tickets'

import { publishEvent } from '@/lib/publishEvent'

export const POST = async (req, context) => {
  const { id } = await context.params
  const { text } = await req.json()

  await dbConnect()

  try {
    const userId = await getUserIdFromRequest(req)

    const { role } = (await User.findById(userId).select('role').lean()) ?? {}

    const ticket = await Ticket.findById(id).populate([
      { path: 'user', select: '_id name email role' },
      {
        path: 'agent',
        select: '_id user level',
        populate: {
          path: 'user',
          select: '_id name email role',
        },
      },
    ])

    if (!ticket) {
      return NextResponse.json({ status: 'error', message: 'Not found' }, { status: 404 })
    }

    const isOwner = ticket.user?._id.equals?.(userId) ?? false
    const isAssignedAgent = ticket.agent?.user?._id?.equals?.(userId) ?? false
    const isAdmin = role === 'admin'

    if (!isOwner && !isAssignedAgent && !isAdmin) {
      return NextResponse.json({ status: 'error', message: 'Not found' }, { status: 404 })
    }

    const newTicket = await addMessage({
      ticketId: id,
      text,
      from: role,
    })

    const messages = newTicket?.messages ?? []
    const newMsg = messages.length ? messages[messages.length - 1] : null

    if (newMsg) {
      publishEvent(id, 'message', {
        ticketId: id,
        type: 'message',
        message: newMsg,
      })
    }

    return NextResponse.json(
      {
        status: 'ok',
        ticket: newTicket,
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
