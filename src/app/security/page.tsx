"use client"

import { useLang } from "@/lang/useLang";
import { getInforWallet, addGoogleAuthenticator, verifyGoogleAuthenticator, removeGoogleAuthenticator } from "@/services/api/TelegramWalletService";
import { useQuery } from "@tanstack/react-query";
import type React from "react"

import { useState } from "react"

export default function GoogleAuthenticatorBind() {
const { data: walletInfor, refetch } = useQuery({
    queryKey: ["wallet-infor"],
    queryFn: getInforWallet,
});

  const { t } = useLang();
  const [verificationCode, setVerificationCode] = useState(["", "", "", "", "", ""])
  const [showStep2, setShowStep2] = useState(false)
  const [qrCodeUrl, setQrCodeUrl] = useState("")
  const [secretKey, setSecretKey] = useState("")
  const [copiedKey, setCopiedKey] = useState(false)
  const [copiedUser, setCopiedUser] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [password, setPassword] = useState("")
  const [passwordError, setPasswordError] = useState("")
  const [removing, setRemoving] = useState(false);
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [removeToken, setRemoveToken] = useState("");
  const [removePassword, setRemovePassword] = useState("");
  const [removeTokenError, setRemoveTokenError] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleNextStep = async () => {
    if (walletInfor?.password) {
      setShowPasswordModal(true);
    } else {
      await proceedWithGoogleAuth();
    }
  }

  const proceedWithGoogleAuth = async (inputPassword?: string) => {
    try {
      const response = await addGoogleAuthenticator(inputPassword || "");
      setQrCodeUrl(response.qr_code_url);
      setSecretKey(response.secret_key);
      setShowStep2(true);
      setShowPasswordModal(false);
      setPasswordError("");
    } catch (error: any) {
      console.error("Error adding Google Authenticator:", error);
      setPasswordError(t('security.invalid_password'));
    }
  }

  const handlePasswordSubmit = async () => {
    if (password) {
      await proceedWithGoogleAuth(password);
      setPassword("");
    }
  }

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      const code = verificationCode.join('');
      const response = await verifyGoogleAuthenticator(code);
      if (response.status === 200) {
        // Handle successful verification
        console.log("Verification successful");
        refetch();
        setErrorMsg("");
        setVerificationCode(["", "", "", "", "", ""]);
      }
    } catch (error: any) {
      console.error("Error verifying code:", error);
      setErrorMsg(t('security.invalid_code'));
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleCopy = async (text: string, type: 'key' | 'user') => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === 'key') {
        setCopiedKey(true);
        setTimeout(() => setCopiedKey(false), 2000);
      } else {
        setCopiedUser(true);
        setTimeout(() => setCopiedUser(false), 2000);
      }
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const handleRemoveGGAuth = () => {
    setShowRemoveModal(true);
    setRemoveToken("");
    setRemovePassword("");
  };

  const handleRemoveConfirm = async () => {
    setRemoving(true);
    setRemoveTokenError("");
    try {
      await removeGoogleAuthenticator(removeToken, removePassword);
      setShowRemoveModal(false);
      setShowStep2(false);
      refetch();
    } catch (error: any) {
      console.error("Error removing Google Authenticator:", error);
      if(error.response.data.message === "Invalid password") {
        setRemoveTokenError(t('security.invalid_password'));
      } 
      if (error.response.data.message === "Invalid verification code") {
        setRemoveTokenError(t('security.invalid_code'));
      }
    } finally {
      setRemoving(false);
    }
  };

  const handleRemoveTokenChange = (index: number, value: string) => {
    if (value.length <= 1 && /^\d*$/.test(value)) {
      const newToken = removeToken.split('');
      newToken[index] = value;
      setRemoveToken(newToken.join(''));

      // Auto-focus next input
      if (value && index < 5) {
        const nextInput = document.getElementById(`remove-token-${index + 1}`);
        nextInput?.focus();
      }
    }
  };

  const handleRemoveTokenKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !removeToken[index] && index > 0) {
      const prevInput = document.getElementById(`remove-token-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleRemoveTokenPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const paste = e.clipboardData.getData('text');
    if (/^\d{6}$/.test(paste)) {
      setRemoveToken(paste);
      e.preventDefault();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const paste = e.clipboardData.getData('text');
    if (/^\d{6}$/.test(paste)) {
      setVerificationCode(paste.split(''));
      e.preventDefault();
    }
  };

  if(!walletInfor) return null;

  return (
    <div className="min-h-screen text-gray-900 dark:text-white p-4 transition-colors duration-300">
      {/* Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-medium mb-4 text-gray-900 dark:text-white">
              {t('security.enter_password')}
            </h3>
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setPasswordError("");
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && password) {
                  handlePasswordSubmit();
                }
              }}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white mb-2"
              placeholder={t('security.password_placeholder')}
            />
            {passwordError && (
              <p className="text-red-500 text-sm mb-4">{passwordError}</p>
            )}
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowPasswordModal(false)}
                className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={handlePasswordSubmit}
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-md"
              >
                {t('common.confirm')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Remove GG Auth Modal */}
      {showRemoveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-medium mb-4 text-gray-900 dark:text-white">
              {t('security.remove_gg_auth_title')}
            </h3>
            <div className="mb-4">
              <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 text-center">
                {t('security.enter_code')}
              </p>
              <div className="flex gap-2 mb-2 justify-center">
                {Array.from({ length: 6 }).map((_, index) => (
                  <input
                    key={index}
                    id={`remove-token-${index}`}
                    type="text"
                    value={removeToken[index] || ''}
                    onChange={(e) => handleRemoveTokenChange(index, e.target.value)}
                    onKeyDown={(e) => handleRemoveTokenKeyDown(index, e)}
                    onPaste={handleRemoveTokenPaste}
                    className="w-12 h-12 text-center bg-white dark:bg-transparent border-2 border-blue-500 text-gray-900 dark:text-white rounded-md text-lg font-medium focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 shadow-sm dark:shadow-none transition-colors duration-300"
                    maxLength={1}
                  />
                ))}
              </div>
              {removeTokenError && (
                <div className="text-red-500 text-sm mb-4 text-center">{removeTokenError}</div>
              )}
            </div>
            {walletInfor?.password && (
              <input
                type="password"
                value={removePassword}
                onChange={e => setRemovePassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white mb-4"
                placeholder={t('security.password_placeholder')}
              />
            )}
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowRemoveModal(false)}
                className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                disabled={removing}
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={handleRemoveConfirm}
                className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-md disabled:opacity-60"
                disabled={removing || !removeToken || (walletInfor?.password && !removePassword)}
              >
                {removing ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {t('security.processing')}
                  </div>
                ) : (
                  t('security.remove_gg_auth')
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-md mx-auto">
        {/* Nếu đã liên kết Google Authenticator thì chỉ hiển thị UI gỡ liên kết */}
        {walletInfor?.isGGAuth ? (
          <div className="flex flex-col items-center justify-center py-16">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-16 h-16 text-green-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2l4-4" />
            </svg>
            <h2 className="text-xl font-semibold mb-2">{t('security.gg_auth_linked')}</h2>
            <p className="mb-6 text-gray-600 dark:text-gray-300 text-center">{t('security.gg_auth_linked_desc')}</p>
            <button
              onClick={handleRemoveGGAuth}
              disabled={removing}
              className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-full transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center disabled:opacity-60"
            >
              {t('security.remove_gg_auth')}
            </button>
          </div>
        ) : (
          <>
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
                      <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(qrCodeUrl)}`} alt="QR Code" className="w-20 h-20" />
                    </div>
                    <div className="flex-1">
                      <div className="mb-2">
                        <span className="text-gray-500 dark:text-gray-400 text-sm">{t('security.step2.user')}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400 text-sm">{t('security.step2.key')}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-900 dark:text-white text-xs font-mono break-all">
                            {secretKey}
                          </span>
                          <button 
                            onClick={() => handleCopy(secretKey, 'key')}
                            className="text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors duration-300 flex-shrink-0"
                          >
                            {copiedKey ? (
                              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            ) : (
                              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                              </svg>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 text-center">
                  {t('security.step2.enter_code')}
                </p>

                {/* Verification Code Input */}
                <div className="flex gap-2 mb-2 justify-center">
                  {verificationCode.map((digit, index) => (
                    <input
                      key={index}
                      id={`code-${index}`}
                      type="text"
                      value={digit}
                      onChange={(e) => handleCodeChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      onPaste={handlePaste}
                      className="w-12 h-12 text-center bg-white dark:bg-transparent border-2 border-blue-500 text-gray-900 dark:text-white rounded-md text-lg font-medium focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 shadow-sm dark:shadow-none transition-colors duration-300"
                      maxLength={1}
                    />
                  ))}
                </div>
                {errorMsg && (
                  <div className="text-red-500 text-sm mb-4 text-center">{errorMsg}</div>
                )}

                {/* Submit Button */}
                <button 
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="w-full h-12 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium text-lg rounded-full transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {t('security.processing')}
                    </div>
                  ) : (
                    t('security.step2.submit')
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
