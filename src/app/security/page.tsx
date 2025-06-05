"use client"

import { useLang } from "@/lang/useLang";
import type React from "react"

import { useState } from "react"

export default function GoogleAuthenticatorBind() {
  const { t } = useLang();
  const [verificationCode, setVerificationCode] = useState(["1", "9", "", "", "", ""])
  const [showStep2, setShowStep2] = useState(false)

  const handleCodeChange = (index: number, value: string) => {
    if (value.length <= 1 && /^\d*$/.test(value)) {
      const newCode = [...verificationCode]
      newCode[index] = value
      setVerificationCode(newCode)

      // Auto-focus next input
      if (value && index < 5) {
        const nextInput = document.getElementById(`code-${index + 1}`)
        nextInput?.focus()
      }
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !verificationCode[index] && index > 0) {
      const prevInput = document.getElementById(`code-${index - 1}`)
      prevInput?.focus()
    }
  }

  const handleNextStep = () => {
    setShowStep2(true)
  }

  return (
    <div className="min-h-screen text-gray-900 dark:text-white p-4 transition-colors duration-300">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center mb-8">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-6 h-6 mr-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <h1 className="text-xl font-medium">{t('security.bind_google_authenticator')}</h1>
        </div>

        {/* Step 1 */}
        <div className="mb-8">
          <h2 className="text-blue-500 text-lg font-medium mb-4">{t('security.step1.title')}</h2>
          <p className="text-gray-600 dark:text-gray-300 text-sm mb-6 leading-relaxed text-center">
            {t('security.step1.description')}
          </p>

          <div className="flex gap-4 mb-8">
            <button className="flex-1 bg-white dark:bg-transparent border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800 rounded-full py-2 px-4 flex items-center justify-center transition-colors duration-300 shadow-sm dark:shadow-none" onClick={() => window.open('https://apps.apple.com/app/google-authenticator/id388497605', '_blank')}>
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.71,19.5C17.88,20.74 17,21.95 15.66,21.97C14.32,22 13.89,21.18 12.37,21.18C10.84,21.18 10.37,21.95 9.1,22C7.79,22.05 6.8,20.68 5.96,19.47C4.25,17 2.94,12.45 4.7,9.39C5.57,7.87 7.13,6.91 8.82,6.88C10.1,6.86 11.32,7.75 12.11,7.75C12.89,7.75 14.37,6.68 15.92,6.84C16.57,6.87 18.39,7.1 19.56,8.82C19.47,8.88 17.39,10.1 17.41,12.63C17.44,15.65 20.06,16.66 20.09,16.67C20.06,16.74 19.67,18.11 18.71,19.5M13,3.5C13.73,2.67 14.94,2.04 15.94,2C16.07,3.17 15.6,4.35 14.9,5.19C14.21,6.04 13.07,6.7 11.95,6.61C11.8,5.46 12.36,4.26 13,3.5Z" />
              </svg>
              {t('security.step1.app_store')}
            </button>
            <button className="flex-1 bg-white dark:bg-transparent border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800 rounded-full py-2 px-4 flex items-center justify-center transition-colors duration-300 shadow-sm dark:shadow-none" onClick={() => window.open('https://play.google.com/store/apps/details?id=com.google.android.apps.authenticator2', '_blank')}>
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.61 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z" />
              </svg>
              {t('security.step1.google_play')}
            </button>
          </div>

          {/* Next Step Button */}
          {!showStep2 && (
            <div className="flex justify-center">
              <button
                onClick={handleNextStep}
                className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium text-sm rounded-full transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-4 h-4 mr-1.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {t('security.step1.next_step')}
              </button>
            </div>
          )}
        </div>

        {/* Step 2 - Only shown after clicking Next Step */}
        {showStep2 && (
          <div className="animate-fadeIn">
            <h2 className="text-blue-500 text-lg font-medium mb-4">{t('security.step2.title')}</h2>

            <p className="text-gray-600 dark:text-gray-300 text-sm mb-6 text-center">
              {t('security.step2.description')}
              <br />
              <span className="text-gray-500 dark:text-gray-400">{t('security.step2.rescan_note')}</span>
            </p>

            {/* QR Code Section */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-transparent rounded-lg p-6 mb-6 shadow-sm dark:shadow-none transition-colors duration-300">
              <div className="flex items-start gap-4">
                <div className="bg-white p-2 rounded border">
                  <svg className="w-20 h-20" viewBox="0 0 100 100">
                    <rect width="100" height="100" fill="black" />
                    <path
                      d="M0,0V40H40V0ZM30,30H10V10H30Z M50,0V10H60V0Z M70,0V10H80V20H70V30H80V40H60V30H50V40H40V50H50V70H40V80H50V90H40V100H60V90H70V100H90V90H100V70H90V60H100V40H90V50H80V40H90V30H100V0ZM90,10H80V20H90Z M0,50V90H40V50ZM30,80H10V60H30Z M50,50V60H60V50Z M80,50V60H90V50Z M60,60V70H70V60Z M80,60V70H90V80H70V90H60V80H50V90H60V100H50V90H40V100H30V90H20V100H10V90H0V100H20V90H30V80H40V70H50V60Z"
                      fill="white"
                    />
                  </svg>
                </div>
                <div className="flex-1">
                  <div className="mb-2">
                    <span className="text-gray-500 dark:text-gray-400 text-sm">{t('security.step2.user')}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-900 dark:text-white">Quy</span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-4 h-4 text-gray-400 hover:text-gray-600 dark:hover:text-white cursor-pointer transition-colors duration-300"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400 text-sm">{t('security.step2.key')}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-900 dark:text-white text-xs font-mono break-all">
                        FsXqRL3DchD8XBrBb8ksECqUpY9psVansCmCCPAeLuW4
                      </span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-4 h-4 text-gray-400 hover:text-gray-600 dark:hover:text-white cursor-pointer flex-shrink-0 transition-colors duration-300"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 text-center">
              {t('security.step2.enter_code')}
            </p>

            {/* Verification Code Input */}
            <div className="flex gap-2 mb-8 justify-center">
              {verificationCode.map((digit, index) => (
                <input
                  key={index}
                  id={`code-${index}`}
                  type="text"
                  value={digit}
                  onChange={(e) => handleCodeChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-12 h-12 text-center bg-white dark:bg-transparent border-2 border-blue-500 text-gray-900 dark:text-white rounded-md text-lg font-medium focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 shadow-sm dark:shadow-none transition-colors duration-300"
                  maxLength={1}
                />
              ))}
            </div>

            {/* Submit Button */}
            <button className="w-full h-12 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium text-lg rounded-full transition-all duration-300 shadow-lg hover:shadow-xl">
              {t('security.step2.submit')}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
