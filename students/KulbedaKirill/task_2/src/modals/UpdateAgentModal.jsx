'use client'

import { useState } from 'react'

import { Dialog, VisuallyHidden } from '@radix-ui/themes'
import { Root, Field, Control, Message, Submit } from '@radix-ui/react-form'
import { Input } from '@/components/Input'
import { FormLabel } from '@/components/FormLabel'
import { MyButton } from '@/components/MyButton'

export function UpdateAgentModal({ onSuccess, currentAgent }) {
  if (!currentAgent) {
    return null
  }

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)

  const agentLevels = ['junior', 'middle', 'senior', 'lead']

  const { Content, Title, Close, Description } = Dialog

  const handleSubmit = async (e) => {
    e.preventDefault()

    const formData = new FormData(e.currentTarget)

    const level = formData.get('level')
    const capacity = formData.get('capacity')

    try {
      setLoading(true)

      const token = JSON.parse(localStorage.getItem('token') || 'null')

      const response = await fetch(`/api/admin/agents/${currentAgent._id}`, {
        method: 'PATCH',
        headers: {
          'content-type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          level,
          capacity,
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

  return (
    <Content>
      <Title>Update Agent</Title>
      <VisuallyHidden>
        <Description>Update Agent</Description>
      </VisuallyHidden>

      <Root onSubmit={handleSubmit}>
        <div className='pt-4 pb-8'>
          <div className='w-full flex flex-col gap-5'>
            <Field className='flex flex-col relative' name='level'>
              <FormLabel htmlFor='create_agent_select'>Level</FormLabel>

              <Control asChild>
                <select
                  id='update_agent_select'
                  name='level'
                  defaultValue={currentAgent.level || ''}
                  required={true}
                  className='select-form'
                >
                  <option value={''} disabled>
                    Chose level
                  </option>
                  {agentLevels.map((item, index) => (
                    <option
                      key={`update_agent_select_${index}`}
                      value={item}
                      className='first-letter:uppercase'
                    >
                      {item}
                    </option>
                  ))}
                </select>
              </Control>

              <div className='absolute top-full error'>
                <Message match='valueMissing'>Select a level</Message>
              </div>
            </Field>

            <Field className='flex-col flex relative' name='capacity'>
              <FormLabel htmlFor='update_agent_capacity'>Capacity</FormLabel>

              <Control asChild>
                <Input
                  id='update_agent_capacity'
                  name='capacity'
                  type='text'
                  defaultValue={currentAgent.capacity || ''}
                  min={3}
                  max={10}
                />
              </Control>

              <div className='absolute top-full error'>
                <Message match='valueMissing'>Enter your capacity</Message>
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
