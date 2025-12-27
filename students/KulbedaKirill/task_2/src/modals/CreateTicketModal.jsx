'use client'

import { useState } from 'react'

import { Dialog } from '@radix-ui/themes'
import { Root, Field, Control, Message, Submit } from '@radix-ui/react-form'
import { Input } from '@/components/Input'
import { FormLabel } from '@/components/FormLabel'
import { MyButton } from '@/components/MyButton'
import { TextArea } from '@/components/TextArea'

import { useRegularUserTicketsStore } from '@/store/useRegularUserTicketsStore'
import { useQueusStore } from '@/store/useQueusStore'

export function CreateTicketModal({ onSuccess }) {
  const [loading, setLoading] = useState(false)

  const { Content, Title, Close, Description } = Dialog

  const queues = useQueusStore((state) => state.queues)
  const addTicket = useRegularUserTicketsStore((state) => state.addTicket)

  const handleSubmit = async (e) => {
    e.preventDefault()

    const formData = new FormData(e.currentTarget)

    const title = formData.get('title')
    const queue = formData.get('queue')
    const message = formData.get('message')

    setLoading(true)

    const token = JSON.parse(localStorage.getItem('token') || 'null')

    const response = await fetch('/api/user/tickets', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        title,
        queue,
        message,
      }),
    })
    const body = await response.json()

    if (body.status === 'error') {
      alert(body.message)
    }

    if (body.status === 'ok') {
      addTicket(body.ticket)
      onSuccess?.()
    }

    setLoading(false)
  }

  return (
    <Content>
      <Title>Create Ticket</Title>
      <Description>Describe your problem</Description>

      <Root onSubmit={handleSubmit}>
        <div className='pt-4 pb-8'>
          <div className='w-full flex flex-col gap-5'>
            <Field className='flex-col flex relative' name='title'>
              <FormLabel htmlFor='create_ticket_form_title'>Title</FormLabel>

              <Control asChild>
                <Input id='create_ticket_form_title' name='title' type='text' required />
              </Control>

              <div className='absolute top-full error'>
                <Message match='valueMissing'>Enter your title</Message>
              </div>
            </Field>

            <Field className='flex flex-col relative' name='queue'>
              <FormLabel htmlFor='create_ticket_form_queue'>Queue</FormLabel>

              <Control asChild>
                <select
                  id='create_ticket_form_queue'
                  name='queue'
                  defaultValue=''
                  required={true}
                  className='select-form'
                >
                  <option value={''} disabled>
                    Chose queue
                  </option>
                  {(queues ?? []).map((item) => (
                    <option key={item._id} value={item._id}>
                      {item.title}
                    </option>
                  ))}
                </select>
              </Control>

              <div className='absolute top-full error'>
                <Message match='valueMissing'>Select a queue</Message>
              </div>
            </Field>

            <Field className='flex-col flex relative' name='message'>
              <FormLabel htmlFor='create_ticket_form_textarea'>Message</FormLabel>

              <Control asChild>
                <TextArea id='create_ticket_form_textarea' name='message' required />
              </Control>

              <div className='absolute top-full error'>
                <Message match='valueMissing'>Enter your message</Message>
              </div>
            </Field>
          </div>
        </div>

        <div className='w-full flex justify-end gap-2'>
          <Close asChild>
            <MyButton color='red' variant='soft' disabled={loading}>
              Cancel
            </MyButton>
          </Close>
          <Submit asChild>
            <MyButton disabled={loading}>Create</MyButton>
          </Submit>
        </div>
      </Root>
    </Content>
  )
}
