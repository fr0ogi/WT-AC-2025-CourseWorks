import { getAgent, deleteAgent } from '@/queries/agents'
import { NextResponse } from 'next/server'

import { requireAdmin } from '@/lib/checkAdmin'
import { patchAgent } from '@/queries/agents'

import dbConnect from '@/lib/mongodb'

export const GET = async (req, context) => {
  const { id } = await context.params

  await dbConnect()

  try {
    await requireAdmin(req)

    const agent = await getAgent({ id })

    return NextResponse.json(
      {
        status: 'ok',
        agent,
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
  const { capacity, level } = await req.json()

  await dbConnect()

  try {
    await requireAdmin(req)

    const agent = await patchAgent({ id, capacity, level })

    return NextResponse.json(
      {
        status: 'ok',
        agent,
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

    const agent = await deleteAgent({ id })

    return NextResponse.json(
      {
        status: 'ok',
        agent,
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
