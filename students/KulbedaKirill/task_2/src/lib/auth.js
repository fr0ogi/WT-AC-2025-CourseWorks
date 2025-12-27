import jwt from 'jsonwebtoken'

export function extractBearerToken(req) {
  const h = req.headers.get('authorization') || req.headers.get('Authorization') || ''
  return h.startsWith('Bearer ') ? h.slice(7).trim() : null
}

export function verifyJWT(token) {
  const secret = process.env.JWT_SECRET

  if (!secret) {
    throw new Error('Server misconfigured: JWT_SECRET is missing')
  }

  try {
    return jwt.verify(token, secret)
  } catch {
    throw new Error('Invalid or expired token')
  }
}

export function getUserIdFromRequest(req) {
  const token = extractBearerToken(req)
  if (!token) {
    throw new Error('Unauthorized: no token')
  }

  const payload = verifyJWT(token)
  if (!payload?.id) {
    throw new Error('Invalid token payload: no user id')
  }

  return payload.id
}
