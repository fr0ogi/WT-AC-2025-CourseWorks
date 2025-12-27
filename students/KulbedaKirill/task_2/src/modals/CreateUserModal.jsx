'use client'

import { useState } from 'react'

import { Dialog, VisuallyHidden } from '@radix-ui/themes'
import { Root, Field, Control, Message, Submit } from '@radix-ui/react-form'
import { Input } from '@/components/Input'
import { FormLabel } from '@/components/FormLabel'
import { MyButton } from '@/components/MyButton'

export function CreateUserModal({ onSuccess }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)

  const { Content, Title, Close, Description } = Dialog

  const handleSubmit = async (e) => {
    e.preventDefault()

    const formData = new FormData(e.currentTarget)

    const firstname = formData.get('firstname')
    const lastname = formData.get('lastname')
    const email = formData.get('email')
    const password = formData.get('password')

    try {
      setLoading(true)

      const token = JSON.parse(localStorage.getItem('token') || 'null')

      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          firstname,
          lastname,
          email,
          password,
          role: 'user',
        }),
      })
      const body = await response.json()

      if (body.status === 'ok') {
        onSuccess?.()
      }
    } catch (error) {
      setError(error.message)
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Content>
      <Title>Create Regular User</Title>
      <VisuallyHidden>
        <Description>Create Regular User</Description>
      </VisuallyHidden>

      <Root onSubmit={handleSubmit}>
        <div className='pt-4 pb-8'>
          <div className='w-full flex flex-col gap-5'>
            <Field className='flex-col flex relative' name='firstname'>
              <FormLabel htmlFor='create_user_firstname'>Firstname</FormLabel>

              <Control asChild>
                <Input id='create_user_firstname' name='firstname' type='text' required />
              </Control>

              <div className='absolute top-full error'>
                <Message match='valueMissing'>Enter your firstname</Message>
              </div>
            </Field>

            <Field className='flex-col flex relative' name='lastname'>
              <FormLabel htmlFor='create_user_lastname'>Lastname</FormLabel>

              <Control asChild>
                <Input id='create_user_lastname' name='lastname' type='text' required />
              </Control>

              <div className='absolute top-full error'>
                <Message match='valueMissing'>Enter your lastname</Message>
              </div>
            </Field>

            <Field className='flex-col flex relative' name='email'>
              <FormLabel htmlFor='create_user_email'>Email</FormLabel>

              <Control asChild>
                <Input id='create_user_email' name='email' type='text' required />
              </Control>

              <div className='absolute top-full error'>
                <Message match='valueMissing'>Enter your email</Message>
              </div>
            </Field>

            <Field className='flex-col flex relative' name='password'>
              <FormLabel htmlFor='create_user_password'>Password</FormLabel>

              <Control asChild>
                <Input id='create_user_password' name='password' type='text' required />
              </Control>

              <div className='absolute top-full error'>
                <Message match='valueMissing'>Enter your password</Message>
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
