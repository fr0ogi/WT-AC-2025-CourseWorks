'use client'

import clsx from 'clsx'

import { useEffect } from 'react'
import Link from 'next/link'

import { useQueusStore } from '@/store/useQueusStore'

export function AdminWrapper() {
  const fetchQueues = useQueusStore((state) => state.fetchQueues)

  useEffect(() => {
    fetchQueues()
  }, [fetchQueues])

  return (
    <div className='flex flex-col'>
      <h1 className='font-bold text-2xl text-center mb-3'>Choose collection</h1>
      <div className='grid grid-cols-1 gap-2 md:grid-cols-4 sm:grid-cols-2'>
        <Link
          href={'/admin/users'}
          className={clsx(
            'border border-transparent py-1 px-3 rounded-sm text-center',
            'hover:border-indigo-600 hover:text-indigo-600 hover:bg-indigo-100',
            'transition-colors'
          )}
        >
          To Users
        </Link>
        <Link
          href={'/admin/agents'}
          className={clsx(
            'border border-transparent py-1 px-3 rounded-sm text-center',
            'hover:border-indigo-600 hover:text-indigo-600 hover:bg-indigo-100',
            'transition-colors'
          )}
        >
          To Agents
        </Link>
        <Link
          href={'/admin/queues'}
          className={clsx(
            'border border-transparent py-1 px-3 rounded-sm text-center',
            'hover:border-indigo-600 hover:text-indigo-600 hover:bg-indigo-100',
            'transition-colors'
          )}
        >
          To Queues
        </Link>
      </div>
    </div>
  )
}
