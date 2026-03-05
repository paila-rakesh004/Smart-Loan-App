import Link from 'next/link'
// import styles from './page.module.css'

export default function Page() {

  return (
    <div className='flex h-[100vh] w-full font-serif'>

      <div className="flex-1 bg-[url('/bank.webp')] bg-cover bg-center">
        <div className="bg-black/50 h-full text-white flex flex-col justify-center items-center gap-[10px]">
          <h1 className = "text-4xl font-bold">Smart Loan System</h1>
          <p className="text-lg">Fast • Secure • Reliable</p>
        </div>
      </div>

      
      <div className="flex flex-1 bg-black justify-center align-center">
        <div className="w-[400px] bg-white rounded-4xl p-[30px] flex flex-col gap-[15px] align-center h-60 mt-60 shadow-xl">
          <h2 className="mb-2 text-center text-2xl">Welcome !</h2>

          <Link href="/login" className="w-full p-[12px] rounded-xl text-center bg-indigo-500 text-white hover:bg-indigo-700 hover:-translate-y-1">
            Login
          </Link>

          <Link href="/register" className="w-full p-[12px] rounded-xl text-center bg-indigo-500 text-white hover:bg-indigo-700 hover:-translate-y-1">
            Register
          </Link>

        </div>
      </div>

    </div>
  )
}
