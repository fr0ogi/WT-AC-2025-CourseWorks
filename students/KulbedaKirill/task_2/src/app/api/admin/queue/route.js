import { NextResponse } from 'next/server'

import { requireAdmin } from '@/lib/checkAdmin'
import dbConnect from '@/lib/mongodb'
import { createQueue } from '@/queries/queue'
import { Queue } from '@/models/Queue'

export const POST = async (req) => {
  const { title } = await req.json()

  await dbConnect()

  try {
    await requireAdmin(req)

    const queue = await createQueue({ title })

    return NextResponse.json(
      {
        status: 'ok',
        queue,
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

export async function GET(req) {
  await dbConnect()

  try {
    await requireAdmin(req)

    const { searchParams } = new URL(req.url)
    const page = Math.max(1, Number(searchParams.get('page') ?? 1))
    const limit = Math.min(100, Math.max(1, Number(searchParams.get('limit') ?? 20)))
    const skip = (page - 1) * limit

    const q = searchParams.get('q')?.trim()
    const role = searchParams.get('role')?.trim()

    const query = {}
    if (q) {
      query.$or = [
        { firstname: { $regex: q, $options: 'i' } },
        { lastname: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } },
      ]
    }
    if (role) query.role = role

    const [items, total] = await Promise.all([
      Queue.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Queue.countDocuments(query),
    ])

    return NextResponse.json(
      {
        status: 'ok',
        queues: items,
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      { status: 200 }
    )
  } catch (error) {
    console.error(error)
    return NextResponse.json({ status: 'error', message: error.message }, { status: 401 })
  }
}
