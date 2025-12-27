'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

import { Card } from '@radix-ui/themes'
import { ReloadIcon } from '@radix-ui/react-icons'

import { Loading } from '@/components/Loading'
import { WrapperQueue } from '@/components/WrapperQueue'
import { MyButton } from '@/components/MyButton'

import { useQueusStore } from '@/store/useQueusStore'
import { useAgentOpenTicketsStore } from '@/store/useAgentOpenTicketsStore'
import { useAgentStore } from '@/store/useAgentStore'

export function AgentWrapper() {
  const queues = useQueusStore((state) => state.queues)
  const fetchQueues = useQueusStore((state) => state.fetchQueues)

  const isTicketsLoading = useAgentOpenTicketsStore((state) => state.isTicketsLoading)
  const fetchTickets = useAgentOpenTicketsStore((state) => state.fetchTickets)
  const tickets = useAgentOpenTicketsStore((state) => state.tickets)

  const agent = useAgentStore((state) => state.agent)
  const fetchAgent = useAgentStore((state) => state.fetchAgent)

  const assignedTickets = agent ? agent.assignedTickets : []

  const closedTickets = tickets ? tickets.filter((item) => item.isClose) : []

  useEffect(() => {
    fetchQueues()
  }, [fetchQueues])

  useEffect(() => {
    fetchTickets()
  }, [fetchTickets])

  useEffect(() => {
    fetchAgent()
  }, [fetchAgent])

  const handleReload = async () => {
    try {
      await Promise.all([fetchTickets(), fetchQueues(), fetchAgent()])
    } catch (error) {
      console.error(error)
      alert(error.message)
    }
  }

  return (
    <div className='flex flex-col gap-3'>
      <div className='flex justify-end border-b pb-1.5 border-b-gray-100'>
        <MyButton onClick={handleReload} icon={<ReloadIcon />} iconPos='left'>
          Refresh
        </MyButton>
      </div>
      {assignedTickets.length > 0 && (
        <>
          <h3 className='font-bold text-3xl clamp-2'>
            Assigned Tickets {agent.capacity} / {agent.workload}
          </h3>
          <div className='mt-2 grid md:grid-cols-5 sm:grid-cols-3 grid-cols-1 gap-3'>
            {assignedTickets.map((ticket) => (
              <Ticket key={`assigned_ticket_${ticket._id}`} ticket={ticket} />
            ))}
          </div>
        </>
      )}

      <h3 className='font-bold text-3xl'>Open tickets</h3>

      {isTicketsLoading && <Loading />}

      {queues.map((item) => (
        <WrapperQueue key={item._id} item={item} />
      ))}

      {closedTickets.length > 0 && (
        <>
          <h3 className='font-bold text-3xl'>Closed Tickets</h3>
          <div className='mt-2 grid md:grid-cols-5 sm:grid-cols-3 grid-cols-1 gap-3'>
            {closedTickets.map((ticket) => (
              <Ticket key={`assigned_ticket_${ticket._id}`} ticket={ticket} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

const Ticket = ({ ticket }) => {
  const router = useRouter()

  const handleOpen = () => {
    router.push(`/ticket/${encodeURIComponent(ticket._id)}`)
  }

  return (
    <Card>
      <div className='flex flex-col h-full'>
        <h3 className='mb-1.5 clamp-2'>{ticket.title}</h3>

        <div className='pt-1.5 mt-auto border-t-2 border-gray-200'>
          <MyButton onClick={handleOpen} style={{ width: '100%' }}>
            Open
          </MyButton>
        </div>
      </div>
    </Card>
  )
}
