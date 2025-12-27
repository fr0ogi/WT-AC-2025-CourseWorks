import LoginForm from './components/LoginForm'

export default async function Page() {
  return (
    <section className='py-7 min-h-dvh flex items-center justify-center'>
      <div className='max-w-96 w-full shadow-2xl rounded-md py-8 px-6'>
        <h1 className='text-center font-bold mb-3 text-2xl'>Login</h1>
        <LoginForm />
      </div>
    </section>
  )
}
