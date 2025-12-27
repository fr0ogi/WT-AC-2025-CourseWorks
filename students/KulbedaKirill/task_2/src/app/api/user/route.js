import { NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import dbConnect from '@/lib/mongodb'
import { User } from '@/models/User'

export const GET = async (req) => {
  try {
    const authHeader = req.headers.get('authorization')

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ status: 'error', message: 'Token missing' }, { status: 401 })
    }

    const token = authHeader.split(' ')[1]

    let decoded
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET)
    } catch (error) {
      return NextResponse.json(
        { status: 'error', message: 'Invalid or expired token' },
        { status: 401 }
      )
    }

    await dbConnect()

    const user = await User.findById(decoded.id).select('-password')

    if (!user) {
      return NextResponse.json({ status: 'error', message: 'User not found' }, { status: 404 })
    }

    return NextResponse.json(
      {
        status: 'ok',
        user,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error(error)
    return NextResponse.json({ status: 'error', message: 'Server error' }, { status: 500 })
  }
}
