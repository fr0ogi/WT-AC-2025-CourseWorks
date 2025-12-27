import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'

import { getUserIdFromRequest } from '@/lib/auth'

import { Ticket } from '@/models/Tickets'
import { User } from '@/models/User'

export const GET = async (req) => {
  await dbConnect()

  try {
    const userId = await getUserIdFromRequest(req)
    const { role } = await User.findById(userId).select('role')

    if (role !== 'agent') {
      throw new Error('Invalid role!')
    }

    const tickets = await Ticket.find({}).lean()

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
