import jwt from 'jsonwebtoken'
import dbConnect from '@/lib/mongodb'
import { User } from '@/models/User'

export function extractBearerToken(req) {
  const authHeader = req.headers.get('authorization') || req.headers.get('Authorization') || ''
  return authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : null
}

export async function requireRole(req, allowedRoles = ['admin']) {
  const token = extractBearerToken(req)
  if (!token) {
    throw new Error('Unauthorized: no token')
  }

  let payload
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET)
  } catch {
    throw new Error('Unauthorized: invalid token')
  }

  const userId = payload.id || payload._id
  if (!userId) {
    throw new Error('Bad token: missing user id')
  }

  await dbConnect()

  const user = await User.findById(userId).select('_id role').lean()

  console.log('user', user)

  if (!user) {
    throw new Error('Unauthorized: user not found')
  }

  if (user.isActive === false) {
    throw new Error('Forbidden: user is disabled')
  }

  if (!allowedRoles.includes(user.role)) {
    throw new Error('Forbidden: insufficient role')
  }

  return { user, payload }
}

export async function requireAdmin(req) {
  return requireRole(req, ['admin'])
}
