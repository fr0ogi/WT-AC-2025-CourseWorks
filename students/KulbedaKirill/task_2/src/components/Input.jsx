import { forwardRef } from 'react'

export const Input = forwardRef(({ ...props }, ref) => {
  return (
    <input
      className='bg-gray-200/50 outline-none px-3 py-1.5 rounded-xl w-full'
      ref={ref}
      {...props}
    />
  )
})
