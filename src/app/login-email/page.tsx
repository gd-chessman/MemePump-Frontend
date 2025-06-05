"use client"
import React, { useEffect, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import { login } from '@/services/api/GoogleService'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'

export default function LoginEmail() {
const {isAuthenticated, login: loginAuth } = useAuth();
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
          loginAuth(response.data.token)
          router.push('/dashboard')
        } catch (error) {
          console.error('Login failed:', error)
          // Handle login error here
        }
      }
    }

    handleLogin()
  }, [searchParams, router])

  console.log("TEST code", searchParams.get('code'))

  return (
    <div className="flex items-center justify-center min-h-screen">
    </div>
  )
}
