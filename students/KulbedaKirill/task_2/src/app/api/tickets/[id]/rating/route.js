import mongoose from 'mongoose'
import { NextResponse } from 'next/server'

import dbConnect from '@/lib/mongodb'

import { Rating } from '@/models/Rating'

export const GET = async (_, context) => {
  const { id } = await context.params

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ status: 'error', message: 'Invalid id' }, { status: 400 })
  }

  await dbConnect()

  try {
    const rating = await Rating.findOne({ ticket: id })

    return NextResponse.json(
      {
        status: 'ok',
        rating,
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
