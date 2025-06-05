"use client"
import React, { useEffect, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import { login } from '@/services/api/GoogleService'
import { useRouter } from 'next/navigation'

export default function LoginEmail() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const isProcessing = useRef(false)

  useEffect(() => {
    const handleLogin = async () => {
      const code = searchParams.get('code')
      if (code && !isProcessing.current) {
        isProcessing.current = true
        try {
          const response = await login(code)
          // Handle successful login here
          console.log('Login successful:', response)
          // Redirect to home page or dashboard after successful login
          console.log(response)
        //   router.push('/dashboard')
        } catch (error) {
          console.error('Login failed:', error)
          // Handle login error here
        }
      }
    }

    handleLogin()
  }, [searchParams, router])

  return (
    <div className="flex items-center justify-center min-h-screen">
    </div>
  )
}
