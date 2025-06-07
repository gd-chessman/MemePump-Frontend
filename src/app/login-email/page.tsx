"use client"
import React, { useEffect, useRef, Suspense, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { login } from '@/services/api/GoogleService'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/ui/dialog"
import { useLang } from "@/lang"
import { Button } from "@/ui/button"

function LoginEmailContent() {
  const {isAuthenticated, login: loginAuth } = useAuth();
  const searchParams = useSearchParams()
  const router = useRouter()
  const isProcessing = useRef(false)
  const [showErrorModal, setShowErrorModal] = useState(false)
  const { t } = useLang()

  const handleReturnHome = () => {
    router.push('/dashboard')
  }

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
        } catch (error: any) {
          if(error.status === 400) {
            setShowErrorModal(true)
            console.error('Login failed:', error)
          }
          // Handle login error here
        }
      }
    }

    handleLogin()
  }, [searchParams, router])


  return (
    <div className="flex items-center justify-center min-h-screen">
      <Dialog open={showErrorModal} onOpenChange={setShowErrorModal}>
        <DialogContent className="sm:max-w-[425px] p-0 border-none border-transparent">
          <div className="bg-gradient-to-t from-theme-purple-100 to-theme-gradient-linear-end p-[1px] relative w-full rounded-xl">
            <div className="w-full px-3 py-2 bg-theme-black-200 rounded-xl text-neutral-100">
              <DialogHeader className="p-2">
                <DialogTitle className="text-xl font-semibold text-indigo-500 backdrop-blur-sm boxShadow linear-200-bg mb-2 text-fill-transparent bg-clip-text">
                  {t('login.error')}
                </DialogTitle>
                <DialogDescription className="text-neutral-100 text-sm">
                  {t('login.notActive')}
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="flex justify-center mt-4">
                <Button 
                  onClick={handleReturnHome}
                  className="w-full sm:w-auto h-[30px] px-4 py-1.5 bg-gradient-to-l from-blue-950 to-purple-600 rounded-[30px] outline outline-1 outline-offset-[-1px] outline-indigo-500 backdrop-blur-sm flex justify-center items-center gap-3"
                >
                  <span className="text-xs sm:text-sm font-medium leading-none dark:text-white">
                    {t('login.returnHome')}
                  </span>
                </Button>
              </DialogFooter>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default function LoginEmail() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"></div>}>
      <LoginEmailContent />
    </Suspense>
  )
}
