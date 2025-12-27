import { NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { User } from '@/models/User'
import { createUser } from '@/queries/users'
import dbConnect from '@/lib/mongodb'
import { checkUserRole } from '@/lib/checkUserRole'

import bcrypt from 'bcryptjs'

export const POST = async (req) => {
  const { firstname, lastname, email, password, role } = await req.json()

  await dbConnect()

  const hashedPassword = await bcrypt.hash(password, 6)
  const payload = {
    firstname,
    lastname,
    email,
    password: hashedPassword,
    role,
  }

  try {
    checkUserRole(role)

    const user = await createUser(payload)

    return NextResponse.json(
      {
        status: 'ok',
        user,
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

  const authHeader = req.headers.get('authorization') || ''
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null
  if (!token) {
    return NextResponse.json(
      { status: 'error', message: 'Unauthorized: no token' },
      { status: 401 }
    )
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET)
    const actor = await User.findById(payload.id).select('role').lean()

    if (!actor) {
      return NextResponse.json(
        { status: 'error', message: 'Unauthorized: user not found' },
        { status: 401 }
      )
    }
    if (actor.role !== 'admin') {
      return NextResponse.json(
        { status: 'error', message: 'Forbidden: admin only' },
        { status: 403 }
      )
    }

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
      User.find(query).select('-password').sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      User.countDocuments(query),
    ])

    return NextResponse.json(
      {
        status: 'ok',
        users: items,
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      { status: 200 }
    )
  } catch (err) {
    console.error(err)
    return NextResponse.json(
      { status: 'error', message: 'Unauthorized: invalid token' },
      { status: 401 }
    )
  }
}
