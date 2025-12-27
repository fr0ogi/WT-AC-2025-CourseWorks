'use client'

import { useState } from 'react'

import { Dialog, VisuallyHidden } from '@radix-ui/themes'
import { Root, Field, Control, Message, Submit } from '@radix-ui/react-form'
import { Input } from '@/components/Input'
import { FormLabel } from '@/components/FormLabel'
import { MyButton } from '@/components/MyButton'

export function UpdateQueueModal({ onSuccess, currentQueue }) {
  if (!currentQueue) {
    return null
  }

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)

  const agentLevels = ['junior', 'middle', 'senior', 'lead']

  const { Content, Title, Close, Description } = Dialog

  const handleSubmit = async (e) => {
    e.preventDefault()

    const formData = new FormData(e.currentTarget)

    const title = formData.get('title')

    try {
      setLoading(true)

      const token = JSON.parse(localStorage.getItem('token') || 'null')

      const response = await fetch(`/api/admin/queue/${currentQueue._id}`, {
        method: 'PATCH',
        headers: {
          'content-type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
        }),
      })
      const body = await response.json()

      if (body.status === 'error') {
        setError(body.message)
      }

      if (body.status === 'ok') {
        onSuccess?.()
      }
    } catch (error) {
      setError(error.message)
      console.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  console.log('currentQueue', currentQueue)

  return (
    <Content>
      <Title>Update Queue</Title>
      <VisuallyHidden>
        <Description>Update Queue</Description>
      </VisuallyHidden>

      <Root onSubmit={handleSubmit}>
        <div className='pt-4 pb-8'>
          <div className='w-full flex flex-col gap-5'>
            <Field className='flex-col flex relative' name='title'>
              <FormLabel htmlFor='update_queue_title'>Title</FormLabel>

              <Control asChild>
                <Input
                  id='update_queue_title'
                  name='title'
                  type='text'
                  defaultValue={currentQueue.title || ''}
                />
              </Control>

              <div className='absolute top-full error'>
                <Message match='valueMissing'>Enter title</Message>
              </div>
            </Field>
          </div>

          {error && <div className='error error-bg mt-6 text-center'>{error}</div>}
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
