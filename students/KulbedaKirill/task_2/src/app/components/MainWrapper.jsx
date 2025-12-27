'use client'

import { useUserStore } from '@/store/useUserStore'

import { RegularUserWrapper } from './RegularUserWrapper'
import { AgentWrapper } from './AgentWrapper'
import { AdminWrapper } from './AdminWrapper'

export function MainWrapper() {
  const user = useUserStore((state) => state.user)

  return (
    <div className='mt-14 pb-28'>
      {user && (
        <>
          {user.role === 'user' && <RegularUserWrapper />}
          {user.role === 'agent' && <AgentWrapper />}
          {user.role === 'admin' && <AdminWrapper />}
        </>
      )}
    </div>
  )
}
