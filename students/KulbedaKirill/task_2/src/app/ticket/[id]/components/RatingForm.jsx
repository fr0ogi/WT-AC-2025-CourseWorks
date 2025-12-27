'use client'

import { useState } from 'react'
import { Dialog } from '@radix-ui/themes'

import { MyButton } from '@/components/MyButton'
import { CreateFeedback } from '@/modals/CreateFeedback'

export const RatingForm = () => {
  const { Root, Trigger } = Dialog
  const [open, setOpen] = useState(false)

  return (
    <Root open={open} onOpenChange={setOpen}>
      <div className='py-5 flex justify-center items-center gap-2.5 flex-col'>
        <p>Leave your rating</p>
        <Trigger asChild>
          <MyButton>Rate</MyButton>
        </Trigger>
      </div>

      <CreateFeedback open={open} />
    </Root>
  )
}
