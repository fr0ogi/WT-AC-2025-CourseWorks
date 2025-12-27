'use client'

import { forwardRef } from 'react'

export const Select = forwardRef(
  ({ name = '', defaultValue = '', id = '', required = false, defaultItem, renderItems }, ref) => {
    return (
      <select
        id={id}
        ref={ref}
        name={name}
        defaultValue={defaultValue}
        required={required}
        className='bg-gray-200/50 outline-none px-3 py-1.5 rounded-xl w-full h-[36px]'
      >
        {defaultItem && defaultItem()}
        {renderItems && renderItems()}
        {/* {(items ?? []).map((q) => (
          <option key={i._id} value={i._id}>
            {q.title}
          </option>
        ))} */}
      </select>
    )
  }
)
