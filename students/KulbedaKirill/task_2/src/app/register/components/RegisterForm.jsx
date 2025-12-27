'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

import { Root, Field, Control, Message, Submit } from '@radix-ui/react-form'
import { Button } from '@radix-ui/themes'
import { Input } from '@/components/Input'
import { FormLabel } from '@/components/FormLabel'
import Link from 'next/link'

export default function RegisterForm() {
  const [loading, setLoading] = useState(false)

  const router = useRouter()

  const handleSubmit = async (e) => {
    e.preventDefault()

    const formData = new FormData(e.currentTarget)

    const firstname = formData.get('firstname')
    const lastname = formData.get('lastname')
    const email = formData.get('email')
    const password = formData.get('password')

    setLoading(true)

    const response = await fetch('/api/user/register', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        firstname,
        lastname,
        email,
        password,
      }),
    })
    const body = await response.json()

    if (body.status === 'error') {
      alert(body.message)
    }

    router.push('/login')

    setLoading(false)
  }

  return (
    <Root className='w-full flex flex-col gap-5' onSubmit={handleSubmit}>
      <div className='flex gap-4'>
        <Field className='flex-col flex relative' name='firstname'>
          <FormLabel htmlFor='register_form_firstname'>Your name</FormLabel>

          <Control asChild>
            <Input id='register_form_firstname' name='firstname' required />
          </Control>

          <div className='absolute top-full error'>
            <Message match='valueMissing'>Enter your name</Message>
          </div>
        </Field>

        <Field className='flex-col flex relative' name='lastname'>
          <FormLabel htmlFor='register_form_lastname'>Your surname</FormLabel>

          <Control asChild>
            <Input id='register_form_lastname' name='lastname' required />
          </Control>

          <div className='absolute top-full error'>
            <Message match='valueMissing'>Enter your surname</Message>
          </div>
        </Field>
      </div>

      <Field className='flex-col flex relative' name='email'>
        <FormLabel htmlFor='register_form_email'>Email</FormLabel>

        <Control asChild>
          <Input id='register_form_email' name='email' type='email' required />
        </Control>

        <div className='absolute top-full error'>
          <Message match='valueMissing'>Enter your email</Message>
          <Message match='typeMismatch'>Invalid Email</Message>
        </div>
      </Field>

      <Field className='flex-col flex relative' name='password'>
        <FormLabel htmlFor='register_form_password'>Password</FormLabel>

        <Control asChild>
          <Input id='register_form_password' name='password' type='password' required />
        </Control>

        <div className='absolute top-full error'>
          <Message match='valueMissing'>Enter your Password</Message>
        </div>
      </Field>

      <div className='border-t border-t-gray-200/50 pt-2'>
        <Submit asChild>
          <Button style={{ width: '100%' }} disabled={loading}>
            Register
          </Button>
        </Submit>

        <div className='text-center text-sm mt-2.5'>
          Already have an account?{' '}
          <Link className='link' href='/login'>
            Login
          </Link>
        </div>
      </div>
    </Root>
  )
}
