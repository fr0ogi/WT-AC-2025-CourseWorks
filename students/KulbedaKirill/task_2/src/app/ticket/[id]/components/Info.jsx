import clsx from 'clsx'
import { Card, IconButton } from '@radix-ui/themes'
import { ClockIcon, Cross1Icon, StarFilledIcon } from '@radix-ui/react-icons'

import { useUserStore } from '@/store/useUserStore'
import { useTicketStore } from '@/store/useTicketStore'

import { formatAvg } from '@/lib/formatAvg'

import { CloseTicket } from './CloseTicket'

import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import tz from 'dayjs/plugin/timezone'
import 'dayjs/locale/ru'

export const Info = ({ menuOpen, setMenuOpen }) => {
  const ticket = useTicketStore((state) => state.ticket)

  const user = useUserStore((state) => state.user)

  dayjs.extend(utc)
  dayjs.extend(tz)
  dayjs.locale('en')

  const createdAt = ticket
    ? dayjs(ticket.createdAt).tz('Europe/Berlin').format('DD MMM YYYY, HH:mm')
    : null

  const userData = ticket ? ticket?.user : null
  const agentData = ticket ? ticket?.agent?.user : null
  const agentLevel = ticket ? ticket?.agent?.level : null
  const agentRating = ticket && ticket?.agentRating ? ticket?.agentRating[0] : null

  return (
    <div
      className={clsx(
        'py-5 flex flex-col gap-2 z-50 px-2 h-dvh bg-white',
        'fixed left-0 top-0 w-full',
        'md:static md:bg-transparent md:px-0',
        menuOpen ? 'block md:flex' : 'hidden md:flex'
      )}
    >
      {ticket && (
        <>
          <div className='flex justify-end md:hidden'>
            <IconButton variant='soft' color='crimson' onClick={() => setMenuOpen(false)}>
              <Cross1Icon />
            </IconButton>
          </div>
          <Card>
            <h3 className='text-xl font-bold'>{ticket.title}</h3>
            <div className='mt-2 flex flex-col text-sm'>
              <span className='flex items-center gap-1.5'>
                <ClockIcon />
                {createdAt}
              </span>
            </div>
          </Card>
          <Card>
            <div className='flex items-center gap-1.5'>
              <span className='bg-indigo-500/30 text-indigo-500 py-1 px-2 leading-none rounded-xs'>
                Author:
              </span>{' '}
              <b>{userData ? `${userData.firstname} ${userData.lastname}` : ''}</b>
            </div>
          </Card>
          {agentData ? (
            <>
              <Card>
                <span
                  className={clsx(
                    agentData && 'bg-amber-500/30 text-amber-500',
                    'py-1 px-2 leading-none rounded-xs'
                  )}
                >
                  Agent:
                </span>{' '}
                <b>{agentData ? `${agentData.firstname} ${agentData.lastname}` : ''}</b>
              </Card>

              <Card>
                <div className='flex flex-col gap-1'>
                  <div className='flex gap-1'>
                    <span>Agent Rating:</span>
                    <span className='flex items-center gap-0.5 leading-none'>
                      <StarFilledIcon className='text-amber-400' />
                      <b>{agentRating ? formatAvg(agentRating.avg) : ''}</b>
                    </span>
                  </div>
                  <div className='flex gap-1'>
                    <span>Agent Level:</span>
                    <span className='first-letter:uppercase font-bold'>{agentLevel}</span>
                  </div>
                </div>
              </Card>
            </>
          ) : (
            <Card className='text-center'>
              <span className='text-gray-500'>Your agent is on the way</span>
            </Card>
          )}
          {user && user.role === 'agent' && <CloseTicket setMenuOpen={setMenuOpen} />}
        </>
      )}
    </div>
  )
}
