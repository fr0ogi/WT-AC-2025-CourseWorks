'use client'

import { useEffect, useState, useMemo } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useUserStore } from '@/store/useUserStore'

function decodeJwtPayload(token) {
  try {
    const base64 = token.split('.')[1]
    const json = atob(base64.replace(/-/g, '+').replace(/_/g, '/'))
    return JSON.parse(decodeURIComponent(escape(json)))
  } catch {
    return null
  }
}

const PUBLIC_PATHS = ['/login', '/register']

export default function AuthGuard({ children }) {
  const router = useRouter()
  const pathname = usePathname()

  const { user, setUser, clearUser } = useUserStore()

  const [ready, setReady] = useState(false)

  const isPublicPath = useMemo(
    () => PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + '/')),
    [pathname]
  )

  useEffect(() => {
    let cancelled = false

    const initAuth = async () => {
      try {
        const token = JSON.parse(localStorage.getItem('token'))
        if (!token) {
          if (!isPublicPath) {
            router.replace('/login')
          }

          clearUser()

          return
        }

        const payload = decodeJwtPayload(token)
        if (!payload?.exp || payload.exp * 1000 <= Date.now()) {
          localStorage.removeItem('token')
          clearUser()

          if (!isPublicPath) {
            router.replace('/login')
          }

          return
        }

        const res = await fetch('/api/user', {
          method: 'GET',
          headers: { Authorization: `Bearer ${token}` },
          cache: 'no-store',
        })

        if (!res.ok) {
          localStorage.removeItem('token')
          clearUser?.()
          if (!isPublicPath) router.replace('/login')
          return
        }

        const data = await res.json()
        if (cancelled) return

        setUser?.(data.user ?? data)

        if (isPublicPath) {
          router.replace('/')
        }
      } catch (e) {
        localStorage.removeItem('token')

        clearUser()

        if (!isPublicPath) {
          router.replace('/login')
        }
      } finally {
        if (!cancelled) setReady(true)
      }
    }

    initAuth()
    return () => {
      cancelled = true
    }
  }, [isPublicPath, router, clearUser, setUser])

  useEffect(() => {
    if (!ready) return

    const hasToken = !!localStorage.getItem('token')

    if (!hasToken && !isPublicPath) {
      router.replace('/login')
      return
    }

    if (user && isPublicPath) {
      router.replace('/')
    }
  }, [ready, isPublicPath, router, user])

  if (!ready) return null

  return <>{children}</>
}
