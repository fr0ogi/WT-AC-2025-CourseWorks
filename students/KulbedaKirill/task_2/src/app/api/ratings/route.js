import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import { getUserIdFromRequest } from '@/lib/auth'
import { Ticket } from '@/models/Tickets'
import { Rating } from '@/models/Rating'
import mongoose from 'mongoose'

export const POST = async (req) => {
  await dbConnect()
  try {
    const userId = await getUserIdFromRequest(req)
    const { ticketId, score, comment = '' } = await req.json()

    if (!mongoose.Types.ObjectId.isValid(ticketId)) {
      return NextResponse.json({ status: 'error', message: 'Invalid ticketId' }, { status: 400 })
    }

    if (typeof score !== 'number' || score < 1 || score > 5) {
      return NextResponse.json({ status: 'error', message: 'Score must be 1..5' }, { status: 400 })
    }

    const ticket = await Ticket.findById(ticketId).select('user agent isClose').lean()

    if (!ticket) {
      return NextResponse.json({ status: 'error', message: 'Ticket not found' }, { status: 404 })
    }

    if (String(ticket.user) !== String(userId)) {
      return NextResponse.json(
        { status: 'error', message: 'Only ticket owner can rate' },
        { status: 403 }
      )
    }

    if (!ticket.isClose) {
      return NextResponse.json(
        { status: 'error', message: 'Rating allowed only for closed tickets' },
        { status: 400 }
      )
    }

    if (!ticket.agent) {
      return NextResponse.json(
        { status: 'error', message: 'Ticket has no assigned agent' },
        { status: 400 }
      )
    }

    const rating = await Rating.create({
      ticket: ticketId,
      agent: ticket.agent,
      score,
      user: ticket.user,
      comment,
    })

    return NextResponse.json({ status: 'ok', rating }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ status: 'error', message: error.message }, { status: 500 })
  }
}
