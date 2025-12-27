'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { Card, IconButton } from '@radix-ui/themes'
import { HamburgerMenuIcon, MinusCircledIcon } from '@radix-ui/react-icons'
import clsx from 'clsx'

import { useTicketStore } from '@/store/useTicketStore'
import { useUserStore } from '@/store/useUserStore'

import { TextArea } from '@/components/TextArea'
import { MyButton } from '@/components/MyButton'

import { RatingForm } from './RatingForm'

import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import tz from 'dayjs/plugin/timezone'
import 'dayjs/locale/ru'

export const Messages = ({ setMenuOpen, menuOpen }) => {
  const params = useParams()
  const id = params.id

  const user = useUserStore((state) => state.user)
  const ticket = useTicketStore((state) => state.ticket)

  const isClose = ticket ? ticket?.isClose : false

  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [messageLength, setMessageLength] = useState(0)

  const messages = ticket?.messages || []
  const charLimit = 200

  const handleSendMessage = async () => {
    const messageLocal = message.trim()

    setLoading(true)
    setError(null)

    try {
      if (messageLocal.length === 0) {
        throw new Error(`Empty message`)
      }

      if (messageLocal.length > charLimit) {
        throw new Error(`Character limit exceeded.`)
      }

      const token = JSON.parse(localStorage.getItem('token') || 'null')

      const response = await fetch(`/api/tickets/${id}/messages`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ text: message }),
      })
      const body = await response.json()

      if (body.status === 'error') {
        setError(body.message)
      }

      if (body.status === 'ok') {
        console.log(body)
        setMessage('')
        setMessageLength(0)
      }
    } catch (error) {
      console.error(error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleChangeTextArea = (e) => {
    setMessage(e.target.value)
    setMessageLength(e.target.value.length)
  }

  return (
    <section className='h-dvh grid grid-rows-[48px_1fr_auto] pt-5 md:grid-rows-[1fr_auto] md:pt-0'>
      <div className='flex justify-end md:hidden pb-4'>
        <IconButton onClick={() => setMenuOpen(true)} color='cyan'>
          <HamburgerMenuIcon />
        </IconButton>
      </div>
      <div className='overflow-y-auto py-0 md:py-5'>
        <div className='flex flex-col gap-2'>
          {messages.map((item, index) => {
            dayjs.extend(utc)
            dayjs.extend(tz)
            dayjs.locale('en')

            const s = dayjs(item.createdAt).tz('Europe/Berlin').format('DD MMM YYYY, HH:mm')

            let fromColors = ''

            switch (item.from) {
              case 'agent':
                fromColors = 'bg-amber-500/70'
                break
              case 'user':
                fromColors = 'bg-indigo-500/70'
                break
            }

            return (
              <Card key={`msg_${index}`}>
                <p>{item.text}</p>
                <span className='flex items-center text-sm text-gray-500/80 mt-2.5'>
                  <div className={clsx(fromColors, 'size-3 rounded-full')} />
                  <span className='mx-2'>|</span>
                  <span>{s}</span>
                </span>
              </Card>
            )
          })}
        </div>
      </div>

      {isClose && user.role === 'user' && <RatingForm />}

      {isClose && user.role !== 'user' && (
        <div className='py-5 flex justify-center items-center gap-2.5'>
          <MinusCircledIcon />
          <p>Conversation Closed</p>
        </div>
      )}

      {!isClose && (
        <div className='flex-col py-2.5'>
          <TextArea
            value={message}
            onChange={handleChangeTextArea}
            id='send-message-input'
            name='send-message-input'
            className={'resize-none'}
          />

          <div className='flex items-center'>
            <MyButton onClick={handleSendMessage} disabled={loading}>
              Send
            </MyButton>
            <span className='ml-3 text-xs'>
              {messageLength} / {charLimit}
            </span>
            {error && <span className='ml-3 error error-bg'>{error}</span>}
          </div>
        </div>
      )}
    </section>
  )
}
