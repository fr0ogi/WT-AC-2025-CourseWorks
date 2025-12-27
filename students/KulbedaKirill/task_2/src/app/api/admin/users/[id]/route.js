import { NextResponse } from 'next/server'
import mongoose from 'mongoose'
import { User } from '@/models/User'
import jwt from 'jsonwebtoken'

import dbConnect from '@/lib/mongodb'
import { deleteUser, getUser, updateUser } from '@/queries/users'

import bcrypt from 'bcryptjs'

function extractToken(req) {
  const authHeader = req.headers.get('authorization') || ''
  return authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null
}

async function authActor(req) {
  const token = extractToken(req)
  if (!token) {
    return {
      error: NextResponse.json(
        { status: 'error', message: 'Unauthorized: no token' },
        { status: 401 }
      ),
    }
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET)
    const actor = await User.findById(payload.id).select('role').lean()
    if (!actor) {
      return {
        error: NextResponse.json(
          { status: 'error', message: 'Unauthorized: user not found' },
          { status: 401 }
        ),
      }
    }
    return { payload, actor }
  } catch {
    return {
      error: NextResponse.json(
        { status: 'error', message: 'Unauthorized: invalid token' },
        { status: 401 }
      ),
    }
  }
}

// GET /api/admin/users/[id]
export async function GET(req, context) {
  const { id } = await context.params

  await dbConnect()

  const { error, payload, actor } = await authActor(req)
  if (error) return error

  const isOwner = payload.id === id
  const isAdmin = actor.role === 'admin'
  if (!isAdmin && !isOwner) {
    return NextResponse.json(
      { status: 'error', message: 'Forbidden: admin or owner required' },
      { status: 403 }
    )
  }

  try {
    const user = await getUser(id)

    return NextResponse.json({ status: 'ok', user }, { status: 200 })
  } catch (e) {
    console.error('[GET /api/admin/users/:id] ', e)
    return NextResponse.json(
      { status: 'error', message: e.message || 'Internal error' },
      { status: 500 }
    )
  }
}

export async function PATCH(req, context) {
  const { id } = await context.params

  await dbConnect()

  const { error, payload, actor } = await authActor(req)
  if (error) return error

  const isOwner = payload.id === id
  const isAdmin = actor.role === 'admin'
  if (!isAdmin && !isOwner) {
    return NextResponse.json(
      { status: 'error', message: 'Forbidden: admin or owner required' },
      { status: 403 }
    )
  }

  let body
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ status: 'error', message: 'Invalid JSON body' }, { status: 400 })
  }

  const allowedForOwner = ['firstname', 'lastname', 'email', 'password']
  const allowedForAdmin = [...allowedForOwner, 'role']

  const allowed = isAdmin ? allowedForAdmin : allowedForOwner
  const update = Object.fromEntries(
    Object.entries(body).filter(([k, v]) => allowed.includes(k) && v !== undefined)
  )

  if (Object.keys(update).length === 0) {
    return NextResponse.json(
      { status: 'error', message: 'No updatable fields provided' },
      { status: 400 }
    )
  }

  if (!isAdmin && 'role' in update) delete update.role

  try {
    if (update.email) {
      const exists = await User.findOne({ email: update.email, _id: { $ne: id } })
        .select('_id')
        .lean()
      if (exists) {
        return NextResponse.json(
          { status: 'error', message: 'Email already in use' },
          { status: 409 }
        )
      }
    }

    if (update.password) {
      update.password = await bcrypt.hash(update.password, 10)
    }

    const user = await updateUser(id, update)

    return NextResponse.json({ status: 'ok', user }, { status: 200 })
  } catch (e) {
    console.error('[PATCH /api/admin/users/:id] ', e)
    return NextResponse.json(
      { status: 'error', message: e.message || 'Internal error' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/users/[id]
export async function DELETE(req, context) {
  const { id } = await context.params

  await dbConnect()

  const { error, payload, actor } = await authActor(req)
  if (error) return error

  if (payload.id === id) {
    return NextResponse.json(
      { status: 'error', message: 'Forbidden: It is impossible to delete yourself!' },
      { status: 403 }
    )
  }

  if (actor.role !== 'admin') {
    return NextResponse.json(
      { status: 'error', message: 'Forbidden: admin role required' },
      { status: 403 }
    )
  }

  try {
    const user = await deleteUser(id)
    return NextResponse.json({ status: 'ok', user }, { status: 200 })
  } catch (e) {
    console.error('[DELETE /api/admin/users/:id] ', e)
    return NextResponse.json(
      { status: 'error', message: e.message || 'Internal error' },
      { status: 500 }
    )
  }
}
