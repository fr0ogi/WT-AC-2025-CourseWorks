import { NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { login } from '@/queries/users'
import dbConnect from '@/lib/mongodb'

export const POST = async (req) => {
  const { email, password } = await req.json()

  const payload = { email, password }

  await dbConnect()

  try {
    const user = await login(payload)

    const tokenPayload = {
      id: user._id,
      email: user.email,
      role: user.role,
    }

    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    })

    return NextResponse.json(
      {
        status: 'ok',
        user,
        token,
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
