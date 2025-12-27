import { NextResponse } from 'next/server'
import { register } from '@/queries/users'
import dbConnect from '@/lib/mongodb'

import bcrypt from 'bcryptjs'

export const POST = async (req) => {
  const { firstname, lastname, email, password } = await req.json()

  await dbConnect()

  const hashedPassword = await bcrypt.hash(password, 6)
  const payload = {
    firstname,
    lastname,
    email,
    password: hashedPassword,
    role: 'user',
  }

  try {
    const user = await register(payload)

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
