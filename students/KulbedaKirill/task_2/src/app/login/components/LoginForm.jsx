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

    const email = formData.get('email')
    const password = formData.get('password')

    setLoading(true)

    const response = await fetch('/api/user/login', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
      }),
    })
    const body = await response.json()

    if (body.status === 'error') {
      alert(body.message)
    }

    if (body.status === 'ok') {
      localStorage.setItem('token', JSON.stringify(body.token))
      router.push('/')
    }

    setLoading(false)
  }

  return (
    <Root className='w-full flex flex-col gap-5' onSubmit={handleSubmit}>
      <Field className='flex-col flex relative' name='email'>
        <FormLabel htmlFor='login_form_email'>Email</FormLabel>

        <Control asChild>
          <Input id='login_form_email' name='email' type='email' required />
        </Control>

        <div className='absolute top-full error'>
          <Message match='valueMissing'>Enter your email</Message>
          <Message match='typeMismatch'>Invalid Email</Message>
        </div>
      </Field>

      <Field className='flex-col flex relative' name='password'>
        <FormLabel htmlFor='login_form_password'>Password</FormLabel>

        <Control asChild>
          <Input id='login_form_password' name='password' type='password' required />
        </Control>

        <div className='absolute top-full error'>
          <Message match='valueMissing'>Enter your Password</Message>
        </div>
      </Field>

      <div className='border-t border-t-gray-200/50 pt-2'>
        <Submit asChild>
          <Button style={{ width: '100%' }} disabled={loading}>
            Login
          </Button>
        </Submit>

        <div className='text-center text-sm mt-2.5'>
          Don’t have an account?{' '}
          <Link className='link' href='/register'>
            Register
          </Link>
        </div>
      </div>
    </Root>
  )
}
