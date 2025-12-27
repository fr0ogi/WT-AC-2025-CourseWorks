'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import clsx from 'clsx'

import { PlusIcon } from '@radix-ui/react-icons'
import { Card, Dialog } from '@radix-ui/themes'

import { CreateTicketModal } from '@/modals/CreateTicketModal'
import { MyButton } from '@/components/MyButton'
import { useRegularUserTicketsStore } from '@/store/useRegularUserTicketsStore'
import { useQueusStore } from '@/store/useQueusStore'
import { Loading } from '@/components/Loading'

import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import tz from 'dayjs/plugin/timezone'
import 'dayjs/locale/ru'

export function RegularUserWrapper() {
  const { Root, Trigger } = Dialog

  const [open, setOpen] = useState(false)

  const tickets = useRegularUserTicketsStore((state) => state.tickets)
  const isTicketsLoading = useRegularUserTicketsStore((state) => state.isTicketsLoading)
  const fetchTickets = useRegularUserTicketsStore((state) => state.fetchTickets)

  const queues = useQueusStore((state) => state.queues)
  const fetchQueues = useQueusStore((state) => state.fetchQueues)

  const reversedTickets = useMemo(() => [...(tickets ?? [])].reverse(), [tickets])

  useEffect(() => {
    if (tickets.length === 0) {
      fetchTickets()
    }
  }, [fetchTickets])

  useEffect(() => {
    if (queues.length === 0) {
      fetchQueues()
    }
  }, [fetchQueues])

  return (
    <Root open={open} onOpenChange={setOpen}>
      {/* Top */}
      <div className='mb-6'>
        <Trigger asChild>
          <MyButton icon={<PlusIcon />}>Create Ticket</MyButton>
        </Trigger>
      </div>

      {/* Cards */}
      <div className='grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 gap-4'>
        {reversedTickets.length !== 0 && isTicketsLoading && <Loading />}

        {reversedTickets.length === 0 && !isTicketsLoading && <h3>You don't have any tickets.</h3>}

        {reversedTickets.map((item) => {
          dayjs.extend(utc)
          dayjs.extend(tz)
          dayjs.locale('en')

          const s = dayjs(item.updatedAt).tz('Europe/Berlin').format('DD MMM YYYY, HH:mm')

          return (
            <Link className='group' key={item._id} href={`/ticket/${encodeURI(item._id)}`}>
              <Card className='group-hover:-translate-y-0.5 transition-transform h-full relative'>
                {item.isClose && (
                  <div
                    className={clsx(
                      'absolute leading-none right-3 top-2',
                      'bg-emerald-500/30 text-emerald-500 px-2.5 py-1 rounded-lg backdrop-blur-sm'
                    )}
                  >
                    closed
                  </div>
                )}
                <div className='flex flex-col h-full'>
                  <h3 className='text-2xl font-bold w-full pb-2 clamp-2'>{item.title}</h3>
                  <div className='pt-1 mt-auto border-t-2 border-gray-300 '>
                    <h4>
                      Queue: <b>{item.queue.title}</b>
                    </h4>
                  </div>
                  <h4 className='text-sm leading-none mt-1.5 text-gray-400'>{s}</h4>
                </div>
              </Card>
            </Link>
          )
        })}
      </div>

      {/* Modal */}
      <CreateTicketModal onSuccess={() => setOpen(false)} />
    </Root>
  )
}
