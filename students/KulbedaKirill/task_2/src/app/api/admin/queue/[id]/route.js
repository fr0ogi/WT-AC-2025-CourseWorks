import { NextResponse } from 'next/server'

import { requireAdmin } from '@/lib/checkAdmin'
import dbConnect from '@/lib/mongodb'
import { getQueue, patchQueue, deleteQueue } from '@/queries/queue'

export const GET = async (req, context) => {
  const { id } = await context.params

  await dbConnect()

  try {
    await requireAdmin(req)

    const queue = await getQueue({ id })

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

export const PATCH = async (req, context) => {
  const { id } = await context.params
  const { title } = await req.json()

  await dbConnect()

  try {
    await requireAdmin(req)

    const queue = await patchQueue(id, { title })

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

export const DELETE = async (req, context) => {
  const { id } = await context.params

  await dbConnect()

  try {
    await requireAdmin(req)

    const queue = await deleteQueue({ id })

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
