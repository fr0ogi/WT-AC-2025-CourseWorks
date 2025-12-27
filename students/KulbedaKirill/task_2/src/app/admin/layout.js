import Link from 'next/link'
import { Header } from '@/components/Header'

export default function Layout({ children }) {
  return (
    <div className='wrapper'>
      <Header />

      <div className='flex gap-2.5 mt-2.5 flex-wrap'>
        <Link href={'/admin/users'}>Users Page</Link>
        <Link href={'/admin/agents'}>Agents Page</Link>
        <Link href={'/admin/queues'}>Queues Page</Link>
      </div>

      <div className='mt-10'>{children}</div>
    </div>
  )
}
