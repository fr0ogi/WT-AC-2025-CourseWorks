'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Card } from '@radix-ui/themes'

import { useTicketStore } from '@/store/useTicketStore'

import { Loading } from '@/components/Loading'

import { Messages } from './components/Messages'
import { Info } from './components/Info'

export default function Page() {
  const params = useParams()
  const id = params.id

  const [menuOpen, setMenuOpen] = useState(false)

  const fetchTicket = useTicketStore((state) => state.fetchTicket)
  const isTicketLoading = useTicketStore((state) => state.isTicketLoading)
  const ticketError = useTicketStore((state) => state.ticketError)

  const addMessage = useTicketStore((state) => state.addMessage)
  const setAgent = useTicketStore((state) => state.setAgent)
  const setAgentRating = useTicketStore((state) => state.setAgentRating)
  const setClose = useTicketStore((state) => state.setClose)

  useEffect(() => {
    fetchTicket(id)
  }, [fetchTicket])

  useEffect(() => {
    const es = new EventSource(`/api/tickets/${id}/stream`)

    es.addEventListener('message', (evt) => {
      const data = JSON.parse(evt.data)
      addMessage(data.message)
    })

    es.addEventListener('claim', (evt) => {
      const data = JSON.parse(evt.data)
      setAgent(data.agent)
      setAgentRating(data.agentRating)
    })

    es.addEventListener('close', (evt) => {
      setClose()
    })

    es.addEventListener('ping', () => {
      console.log('PING MESSAGES')
    })

    es.onerror = () => {
      console.log('ERROR IN MESSAGES')
    }

    return () => es.close()
  }, [id])

  if (isTicketLoading) {
    return (
      <div className='flex items-center justify-center min-h-dvh'>
        <Loading />
      </div>
    )
  }

  if (ticketError) {
    return (
      <div className='flex items-center justify-center min-h-dvh'>
        <Card className='text-red-400 bg-red-200 border-red-400'>
          <h3>Error: {ticketError}</h3>
        </Card>
      </div>
    )
  }

  return (
    <section className='grid md:grid-cols-[300px_minmax(0,1fr)] grid-cols-1 gap-6'>
      <Info setMenuOpen={setMenuOpen} menuOpen={menuOpen} />
      <Messages setMenuOpen={setMenuOpen} menuOpen={menuOpen} />
    </section>
  )
}
