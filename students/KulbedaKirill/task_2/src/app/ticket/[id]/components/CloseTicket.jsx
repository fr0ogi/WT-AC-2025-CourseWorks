import { useState } from 'react'
import clsx from 'clsx'

import { useTicketStore } from '@/store/useTicketStore'

import { Cross1Icon, CheckIcon } from '@radix-ui/react-icons'
import { MyButton } from '@/components/MyButton'

export const CloseTicket = ({ setMenuOpen }) => {
  const ticket = useTicketStore((state) => state.ticket)

  const isClose = ticket.isClose

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleCloseTicket = async () => {
    setLoading(true)
    setError(null)

    try {
      const token = JSON.parse(localStorage.getItem('token') || 'null')

      const response = await fetch(`/api/agent/tickets/${ticket._id}/close`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      })
      const body = await response.json()

      if (body.status === 'error') {
        setError(body.message)
      }

      if (body.status === 'ok') {
        console.log('body', body)
        setMenuOpen(false)
      }
    } catch (error) {
      console.error(error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }
  return (
    <div className='mt-6 w-full'>
      {isClose ? (
        <div
          className={clsx(
            'leading-8 text-center text-sm font-medium',
            'rounded-sm flex items-center justify-center gap-2',
            'text-gray-700 bg-gray-700/20'
          )}
        >
          <CheckIcon />
          Ticket Closed
        </div>
      ) : (
        <MyButton
          onClick={handleCloseTicket}
          style={{ width: '100%' }}
          variant='soft'
          color='crimson'
          disabled={loading}
        >
          <Cross1Icon />
          Close Ticket
        </MyButton>
      )}
    </div>
  )
}
