'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

import { useAgentOpenTicketsStore } from '@/store/useAgentOpenTicketsStore'
import { useAgentStore } from '@/store/useAgentStore'
import { Card, ChevronDownIcon } from '@radix-ui/themes'
import { ArchiveIcon } from '@radix-ui/react-icons'
import { Loading } from './Loading'
import { MyButton } from './MyButton'

export const WrapperQueue = ({ item }) => {
  const [expanded, setExpanded] = useState(false)

  const tickets = useAgentOpenTicketsStore((state) => state.tickets)
  const isTicketsLoading = useAgentOpenTicketsStore((state) => state.isTicketsLoading)
  const localTickets = tickets.filter(
    (ticket) => ticket.queue === item._id && !ticket.agent && !ticket.isClose
  )

  const handleExpanded = () => {
    setExpanded((prev) => !prev)
  }

  return (
    <Card>
      <div
        className='flex justify-between items-center pr-3.5 cursor-pointer'
        onClick={handleExpanded}
      >
        <div>
          <h3 className='font-bold text-xl'>{item.title}</h3>
          <span className=''>{localTickets.length} items</span>
        </div>
        <div
          style={{
            transform: `rotate(${expanded ? '180' : '0'}deg)`,
          }}
        >
          <ChevronDownIcon />
        </div>
      </div>

      {isTicketsLoading && (
        <div className='mt-2'>
          <Loading />
        </div>
      )}

      {!isTicketsLoading && expanded && (
        <>
          {localTickets.length === 0 ? (
            <div className='mt-2 flex flex-col items-center text-gray-400'>
              <ArchiveIcon width={21} height={21} />
              <h3 className='mt-2'>No tickets for this queue</h3>
            </div>
          ) : (
            <div className='mt-2 grid grid md:grid-cols-4 sm:grid-cols-2 grid-cols-1 gap-4'>
              {localTickets.map((ticket) => (
                <Ticket key={ticket._id} ticket={ticket} />
              ))}
            </div>
          )}
        </>
      )}
    </Card>
  )
}

const Ticket = ({ ticket }) => {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const agent = useAgentStore((state) => state.agent)
  const addTicketToAssignedTickets = useAgentStore((state) => state.addTicketToAssignedTickets)
  const assignedTickets = agent ? agent.assignedTickets : []

  const isAlreadyClaimed = assignedTickets.some((item) => item._id === ticket._id)

  const handleClaimTicket = async (ticket) => {
    const { _id } = ticket

    setLoading(true)

    const token = JSON.parse(localStorage.getItem('token') || 'null')

    const response = await fetch(`/api/agent/tickets/${_id}/claim`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    })
    const body = await response.json()

    if (body.status === 'error') {
      alert(body.message)
    }

    if (body.status === 'ok') {
      addTicketToAssignedTickets(body.ticket)
      router.push(`/ticket/${_id}`)
    }

    setLoading(false)
  }

  return (
    <Card>
      <div className='flex flex-col h-full'>
        <h3 className='mb-1.5 clamp-2'>{ticket.title}</h3>

        <div className='pt-1.5 mt-auto border-t-2 border-gray-200'>
          <MyButton
            onClick={() => handleClaimTicket(ticket)}
            style={{ width: '100%' }}
            disabled={loading || isAlreadyClaimed}
          >
            {isAlreadyClaimed ? 'Claimed' : 'Claim'}
          </MyButton>
        </div>
      </div>
    </Card>
  )
}
