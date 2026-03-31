import Link from 'next/link'

export default function Page() {
  return (
    <div className="min-h-screen w-full bg-[url('/bgimg.png')] bg-cover bg-center font-serif">

      
      <div className="min-h-screen w-full bg-black/70 flex flex-col md:flex-row">

       
        <div className="flex-[0.5] text-indigo-500 flex flex-col justify-center px-6 sm:px-10 md:px-16 py-10">
          
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold leading-tight">
            Smart Loan System
          </h1>

          <p className="mt-4 text-2xl sm:text-lg md:text-2xl text-white max-w-xl ">
            Experience a seamless and intelligent way to apply for loans. 
            Our platform simplifies the entire process with secure verification, 
            faster approvals, and a user-friendly interface designed to save your time and effort.
          </p>

        </div>

        
        <div className="flex-[0.5] flex justify-center items-center px-6 py-10">

          <div className="w-full max-w-sm backdrop-blur-lg bg-white/20 border border-white/30 rounded-3xl p-6 sm:p-8 flex flex-col gap-4 shadow-2xl">
            
            <h2 className="text-center text-xl sm:text-2xl font-semibold text-white">
              Let's Dive!
            </h2>

            <Link
              href="/login"
              className="w-full py-3 rounded-xl text-center bg-indigo-500 text-white transition transform hover:bg-indigo-700 hover:-translate-y-1"
            >
              Login
            </Link>

            <Link
              href="/register"
              className="w-full py-3 rounded-xl text-center bg-indigo-500 text-white transition transform hover:bg-indigo-700 hover:-translate-y-1"
            >
              Register
            </Link>

          </div>

        </div>

      </div>
    </div>
  )
}