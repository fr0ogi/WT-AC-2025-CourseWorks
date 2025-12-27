import { NextResponse } from 'next/server'

import dbConnect from '@/lib/mongodb'
import { Queue } from '@/models/Queue'

export async function GET(req) {
  await dbConnect()

  try {
    const queues = await Queue.find({}).lean()

    return NextResponse.json(
      {
        status: 'ok',
        queues,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error(error)
    return NextResponse.json({ status: 'error', message: error.message }, { status: 401 })
  }
}
