"use client"

import { useRouter } from 'next/navigation'
import React, { useEffect } from 'react'

const page = () => {


   const  router = useRouter();

   
  useEffect(() => {
    setTimeout(() => {
        router.push('/dashboard/officer')
    }, 5000);
  },[])



  return (
    <div className='flex flex-col items-center justify-center text-4xl p-20'>
      Work in progress

      <p className='mt-8 text-sm'>this will automatically redirected to dashboard in 5 seconds.......</p>
    </div>
  )
}

export default page
