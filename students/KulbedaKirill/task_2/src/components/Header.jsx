'use client'

import { ExitIcon, StarFilledIcon } from '@radix-ui/react-icons'

import { useUserStore } from '@/store/useUserStore'
import { useAgentStore } from '@/store/useAgentStore'
import { useTicketStore } from '@/store/useTicketStore'
import { useRegularUserTicketsStore } from '@/store/useRegularUserTicketsStore'
import { useQueusStore } from '@/store/useQueusStore'
import { useAgentOpenTicketsStore } from '@/store/useAgentOpenTicketsStore'

import { formatAvg } from '@/lib/formatAvg'

import { MyButton } from './MyButton'

export function Header() {
  const user = useUserStore((state) => state.user)
  const agent = useAgentStore((state) => state.agent)

  const clearUser = useUserStore((state) => state.clearUser)
  const resetTicket = useTicketStore((state) => state.resetTicket)
  const resetTicketsForUser = useRegularUserTicketsStore((state) => state.resetTickets)
  const resetQueues = useQueusStore((state) => state.resetQueues)
  const resetTicketsForAgent = useAgentOpenTicketsStore((state) => state.resetTickets)
  const resetAgent = useAgentStore((state) => state.resetAgent)

  const rating = agent?.rating

  const handleLogout = () => {
    clearUser()
    resetTicket()
    resetTicketsForUser()
    resetQueues()
    resetTicketsForAgent()
    resetAgent()
    localStorage.removeItem('token')
  }

  return (
    <header className='flex justify-between items-center py-1.5'>
      <div className='flex justify-center gap-1 flex-col'>
        {user && (
          <>
            <span className='font-bold text-2xl'>
              {user.firstname} {user.lastname}
            </span>
            {rating && (
              <span className='text-base flex items-center gap-1'>
                <StarFilledIcon className='text-amber-500' />
                {formatAvg(rating.avg)}
                {/*, from {rating.count} users */}
              </span>
            )}
          </>
        )}
      </div>

      <div>
        <MyButton onClick={() => handleLogout()} icon={<ExitIcon />}>
          Log Out
        </MyButton>
      </div>
    </header>
  )
}
