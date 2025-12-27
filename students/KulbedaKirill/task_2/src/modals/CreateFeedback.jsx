'use client'

import { useEffect, useState } from 'react'
import clsx from 'clsx'

import { Dialog, VisuallyHidden } from '@radix-ui/themes'
import { Root, Field, Control, Message, Submit } from '@radix-ui/react-form'
import { StarIcon, StarFilledIcon, CheckCircledIcon } from '@radix-ui/react-icons'
import { FormLabel } from '@/components/FormLabel'
import { MyButton } from '@/components/MyButton'
import { TextArea } from '@/components/TextArea'
import { Loading } from '@/components/Loading'

import { useTicketStore } from '@/store/useTicketStore'

export function CreateFeedback({ open }) {
  const { Content, Title, Close, Description } = Dialog
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [feedbackExists, setFeedbackExists] = useState(false)

  const ticket = useTicketStore((state) => state.ticket)

  useEffect(() => {
    if (!open || !ticket?._id) return

    let aborted = false
    ;(async () => {
      setLoading(true)
      setError(null)
      try {
        const token = JSON.parse(localStorage.getItem('token') || 'null')
        const res = await fetch(`/api/tickets/${ticket._id}/rating`, {
          method: 'GET',
          headers: {
            'content-type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        })
        const body = await res.json()
        if (!aborted) {
          setFeedbackExists(body.status === 'ok' && (body.exists || body.rating))
        }
      } catch (e) {
        if (!aborted) setError(e instanceof Error ? e.message : 'Unknown error')
      } finally {
        if (!aborted) setLoading(false)
      }
    })()

    return () => {
      aborted = true
    }
  }, [open, ticket?._id])

  if (loading) {
    return (
      <Content>
        <VisuallyHidden>
          <Title>Loading</Title>
        </VisuallyHidden>
        <div className='flex items-center justify-center py-8'>
          <Loading />
        </div>
      </Content>
    )
  }

  return (
    <Content>
      <Title>Feedback</Title>
      <VisuallyHidden>
        <Description>Leave feedback</Description>
      </VisuallyHidden>

      {feedbackExists && (
        <>
          <div className='flex flex-col items-center'>
            <CheckCircledIcon width={31} height={31} className='text-emerald-500' />
            <h3 className='mt-1.5 text-xl'>Ticket has feedback</h3>
          </div>
          <div className='w-full flex justify-end gap-2'>
            <Close asChild>
              <MyButton color='red' variant='soft'>
                Cancel
              </MyButton>
            </Close>
          </div>
        </>
      )}

      {!feedbackExists && (
        <CreateFeedbackContent
          feedbackExists={feedbackExists}
          setFeedbackExists={setFeedbackExists}
        />
      )}
    </Content>
  )
}

function CreateFeedbackContent({ setFeedbackExists }) {
  const [rating, setRating] = useState(0)

  const [loading, setLoading] = useState(false)
  const [ratingError, setRatingError] = useState(null)
  const [error, setError] = useState(null)

  const { Close } = Dialog

  const ticket = useTicketStore((state) => state.ticket)

  const handleSubmit = async (e) => {
    e.preventDefault()

    setLoading(true)

    setRatingError(null)
    setError(null)
    try {
      const formData = new FormData(e.currentTarget)

      const feedback = formData.get('feedback').trim()

      if (rating === 0) {
        setRatingError('Empty rating')
        return
      }

      if (rating < 1 || rating > 5) {
        setRatingError('Rating out of range')
        return
      }

      const token = JSON.parse(localStorage.getItem('token') || 'null')

      const response = await fetch('/api/ratings/', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          score: rating,
          comment: feedback,
          ticketId: ticket._id,
        }),
      })
      const body = await response.json()

      if (body.status === 'ok') {
        setFeedbackExists(true)
      }
    } catch (error) {
      setError(error.message)
      console.error(error)
    } finally {
      setLoading(false)
      setRatingError(null)
      setError(null)
    }
  }

  return (
    <Root onSubmit={handleSubmit}>
      <div className='pt-4 pb-8'>
        <div className='w-full flex flex-col gap-5'>
          {/* Rating */}
          <div className='flex items-center justify-center relative pb-4'>
            <div role='radiogroup' className='flex items-center gap-1'>
              {Array.from({ length: 5 }, (_, i) => {
                return (
                  <button
                    onClick={(e) => {
                      e.preventDefault()
                      setRating(i + 1)
                    }}
                    key={`start_${i}`}
                    role='button'
                    className={clsx(i >= rating ? 'text-gray-500' : 'text-amber-400')}
                  >
                    {i >= rating ? (
                      <StarIcon width={25} height={25} />
                    ) : (
                      <StarFilledIcon width={25} height={25} />
                    )}
                  </button>
                )
              })}
            </div>

            {ratingError && <div className='absolute bottom-0 error'>{ratingError}</div>}
          </div>

          <Field className='flex-col flex relative' name='feedback'>
            <FormLabel htmlFor='feedback_form_textarea'>Feedbak</FormLabel>

            <Control asChild>
              <TextArea id='feedback_form_textarea' name='feedback' required />
            </Control>

            <div className='absolute top-full error'>
              <Message match='valueMissing'>Enter your feedback</Message>
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
  )
}
