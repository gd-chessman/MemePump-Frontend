"use client"

import { useLang } from "@/lang/useLang";
import { getInforWallet, addGoogleAuthenticator, verifyGoogleAuthenticator, removeGoogleAuthenticator, sendVerificationCode, changePassword, sendMailCode, addGmail, verifyGmail } from "@/services/api/TelegramWalletService";
import { useQuery } from "@tanstack/react-query";
import type React from "react"
import notify from "@/app/components/notify";

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation";

export default function SecurityPage() {
  const { data: walletInfor, refetch } = useQuery({
    queryKey: ["wallet-infor"],
    queryFn: getInforWallet,
  });
  const { t } = useLang();
  const [activeTab, setActiveTab] = useState<'password' | 'google-auth' | 'link'>('link');

  if (!walletInfor?.wallet_id) return null;

  return (
    <div className="min-h-screen text-gray-900 dark:text-white p-4 transition-colors duration-300">
      {/* Tab Navigation */}
      <div className="max-w-lg mx-auto mb-8">
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab('link')}
            className={`flex-1 whitespace-nowrap py-4 px-6 text-center font-medium text-sm transition-colors duration-300 ${
              activeTab === 'link'
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            {t('security.link_account')}
          </button>
          {walletInfor?.password && (
            <button
              onClick={() => setActiveTab('password')}
              className={`flex-1 whitespace-nowrap py-4 px-6 text-center font-medium text-sm transition-colors duration-300 ${
                activeTab === 'password'
                  ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              {t('security.change_password')}
            </button>
          )}
          <button
            onClick={() => setActiveTab('google-auth')}
            className={`${walletInfor?.password ? 'flex-1' : 'flex-1'} whitespace-nowrap py-4 px-6 text-center font-medium text-sm transition-colors duration-300 ${
              activeTab === 'google-auth'
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            {t('security.install_google_auth')}
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-md mx-auto">
        {activeTab === 'password' ? (
          <ChangePasswordTab />
        ) : activeTab === 'google-auth' ? (
          <GoogleAuthenticatorBind />
        ) : (
          <LinkAccountTab />
        )}
      </div>
    </div>
  );
}

function ChangePasswordTab() {
  const { t } = useLang();
  const [verificationCode, setVerificationCode] = useState(["", "", "", ""]);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [sendCodeError, setSendCodeError] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  const handleCodeChange = (index: number, value: string) => {
    if (value.length <= 1) {
      const newCode = [...verificationCode];
      newCode[index] = value;
      setVerificationCode(newCode);

      // Auto-focus next input
      if (value && index < 3) {
        const nextInput = document.getElementById(`code-${index + 1}`);
        nextInput?.focus();
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !verificationCode[index] && index > 0) {
      const prevInput = document.getElementById(`code-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const paste = e.clipboardData.getData('text');
    if (paste.length === 4) {
      setVerificationCode(paste.split(''));
      e.preventDefault();
    }
  };

  const handleSendCode = async () => {
    try {
      setIsSendingCode(true);
      setSendCodeError("");
      await sendVerificationCode();
      notify({ message: t('security.code_sent_success'), type: 'success' });
    } catch (error: any) {
      console.error("Error sending verification code:", error);
      setSendCodeError(t('security.send_code_error'));
      notify({ message: t('security.send_code_error'), type: 'error' });
    } finally {
      setIsSendingCode(false);
    }
  };

  const handleChangePassword = async () => {
    // Validate inputs
    if (verificationCode.some(code => !code)) {
      setPasswordError(t('security.enter_verification_code'));
      notify({ message: t('security.enter_verification_code'), type: 'error' });
      return;
    }
    if (!newPassword) {
      setPasswordError(t('security.enter_new_password'));
      notify({ message: t('security.enter_new_password'), type: 'error' });
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError(t('security.password_min_length'));
      notify({ message: t('security.password_min_length'), type: 'error' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError(t('security.passwords_not_match'));
      notify({ message: t('security.passwords_not_match'), type: 'error' });
      return;
    }

    try {
      setIsChangingPassword(true);
      setPasswordError("");
      const code = verificationCode.join('');
      await changePassword(code, newPassword);
      // Reset form after successful change
      setVerificationCode(["", "", "", ""]);
      setNewPassword("");
      setConfirmPassword("");
      notify({ message: t('security.password_changed_success'), type: 'success' });
    } catch (error: any) {
      console.error("Error changing password:", error);
      if (error.response?.data?.message === "Invalid or expired reset code") {
        setPasswordError(t('security.invalid_code'));
        notify({ message: t('security.invalid_code'), type: 'error' });
      } else {
        setPasswordError(t('security.change_password_error'));
        notify({ message: t('security.change_password_error'), type: 'error' });
      }
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div className="animate-fadeIn">
      <h2 className="text-xl font-medium mb-6">{t('security.change_password')}</h2>

      {/* Verification Code Section */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {t('security.verification_code_telegram')}
        </label>
        <div className="flex items-center gap-4">
          <div className="flex gap-2">
            {verificationCode.map((digit, index) => (
              <input
                key={index}
                id={`code-${index}`}
                type="text"
                value={digit}
                onChange={(e) => handleCodeChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={handlePaste}
                className="w-8 h-10 text-center bg-white dark:bg-transparent border-2 border-blue-500 text-gray-900 dark:text-white rounded-md text-base font-medium focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 shadow-sm dark:shadow-none transition-colors duration-300"
                maxLength={1}
              />
            ))}
          </div>
          <button
            onClick={handleSendCode}
            disabled={isSendingCode}
            className="px-3 py-1.5 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium rounded-md transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed min-w-[90px] h-10"
          >
            {isSendingCode ? (
              <div className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {t('security.sending')}
              </div>
            ) : (
              t('security.send_code')
            )}
          </button>
        </div>
        {sendCodeError && (
          <p className="mt-2 text-sm text-red-500">{sendCodeError}</p>
        )}
      </div>

      {/* New Password Section */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {t('security.new_password')}
        </label>
        <input
          type="password"
          value={newPassword}
          onChange={(e) => {
            setNewPassword(e.target.value);
            setPasswordError("");
          }}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-300"
          placeholder={t('security.new_password_placeholder')}
        />
      </div>

      {/* Confirm Password Section */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {t('security.confirm_password')}
        </label>
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => {
            setConfirmPassword(e.target.value);
            setPasswordError("");
          }}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-300"
          placeholder={t('security.confirm_password_placeholder')}
        />
      </div>

      {passwordError && (
        <p className="mb-4 text-sm text-red-500">{passwordError}</p>
      )}

      {/* Submit Button */}
      <button
        onClick={handleChangePassword}
        disabled={isChangingPassword}
        className="w-full h-12 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium text-lg rounded-full transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {isChangingPassword ? (
          <div className="flex items-center justify-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {t('security.changing_password')}
          </div>
        ) : (
          t('security.change_password')
        )}
      </button>
    </div>
  );
}

function GoogleAuthenticatorBind() {
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
    if (value.length <= 1) {
      const newCode = [...verificationCode];
      newCode[index] = value;
      setVerificationCode(newCode);

      // Auto-focus next input
      if (value && index < 5) {
        const nextInput = document.getElementById(`code-${index + 1}`);
        nextInput?.focus();
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !verificationCode[index] && index > 0) {
      const prevInput = document.getElementById(`code-${index - 1}`);
      prevInput?.focus();
    }
  };

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
                    className="w-8 h-10 text-center bg-white dark:bg-transparent border-2 border-blue-500 text-gray-900 dark:text-white rounded-md text-base font-medium focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 shadow-sm dark:shadow-none transition-colors duration-300"
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
                      className="w-8 h-10 text-center bg-white dark:bg-transparent border-2 border-blue-500 text-gray-900 dark:text-white rounded-md text-base font-medium focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 shadow-sm dark:shadow-none transition-colors duration-300"
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
                  className="mt-4 w-full h-12 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium text-lg rounded-full transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-60 disabled:cursor-not-allowed"
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

function LinkAccountTab() {
  const { data: walletInfor, refetch } = useQuery({
    queryKey: ["wallet-infor"],
    queryFn: getInforWallet,
  });
  const searchParams = useSearchParams()
  const code = searchParams.get('code')
  const { t } = useLang();
  const [isLinking, setIsLinking] = useState(false);
  const [isLinked, setIsLinked] = useState(false);
  const [telegramCode, setTelegramCode] = useState(["", "", "", "", "", "", "", ""]);
  const [errorMsg, setErrorMsg] = useState("");
  const [isSendingCode, setIsSendingCode] = useState(false);

  useEffect(() => {
    const autoLink = async () => {
      if (code) {
        try {
          setIsLinking(true);
          setErrorMsg("");
          await addGmail(code);
          setIsLinked(true);
          notify({ message: t('security.account_linked_success'), type: 'success' });
          refetch();
        } catch (error: any) {
          console.error("Error linking account:", error);
          if (error.response?.data?.message === "Invalid telegram code") {
            setErrorMsg(t('security.invalid_telegram_code'));
            notify({ message: t('security.invalid_telegram_code'), type: 'error' });
          } else if (error.response?.data?.message === "Invalid verification code") {
            setErrorMsg(t('security.invalid_verification_code'));
            notify({ message: t('security.invalid_verification_code'), type: 'error' });
          } else {
            setErrorMsg(t('security.account_linking_error'));
            notify({ message: t('security.account_linking_error'), type: 'error' });
          }
        } finally {
          setIsLinking(false);
        }
      }
    };

    autoLink();
  }, [code, refetch]);

  const handleTelegramCodeChange = (index: number, value: string) => {
    if (value.length <= 1) {
      const newCode = [...telegramCode];
      newCode[index] = value;
      setTelegramCode(newCode);

      // Auto-focus next input
      if (value && index < 7) {
        const nextInput = document.getElementById(`telegram-code-${index + 1}`);
        nextInput?.focus();
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !telegramCode[index] && index > 0) {
      const prevInput = document.getElementById(`telegram-code-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const paste = e.clipboardData.getData('text');
    if (paste.length === 8) {
      setTelegramCode(paste.split(''));
      e.preventDefault();
    }
  };

  const handleLinkAccount = async () => {
    // Validate inputs
    if (telegramCode.some(code => !code)) {
      setErrorMsg(t('security.enter_telegram_code'));
      notify({ message: t('security.enter_telegram_code'), type: 'error' });
      return;
    }

    try {
      setIsLinking(true);
      setErrorMsg("");
      
      if (walletInfor?.email && !walletInfor?.isActiveMail) {
        // Nếu đã có email nhưng chưa active thì gọi verifyGmail
        await verifyGmail(telegramCode.join(''));
      } else {
        // Nếu chưa có email thì gọi addGmail
        await addGmail(code || "");
      }
      
      setIsLinked(true);
      notify({ message: t('security.account_linked_success'), type: 'success' });
      refetch();
    } catch (error: any) {
      console.error("Error linking account:", error);
      if (error.response?.data?.message === "Invalid telegram code") {
        setErrorMsg(t('security.invalid_telegram_code'));
        notify({ message: t('security.invalid_telegram_code'), type: 'error' });
      } else if (error.response?.data?.message === "Invalid verification code") {
        setErrorMsg(t('security.invalid_verification_code'));
        notify({ message: t('security.invalid_verification_code'), type: 'error' });
      } else {
        setErrorMsg(t('security.account_linking_error'));
        notify({ message: t('security.account_linking_error'), type: 'error' });
      }
    } finally {
      setIsLinking(false);
    }
  };

  const handleSendCode = async () => {
    try {
      setIsSendingCode(true);
      await sendMailCode();
      notify({ message: t('security.code_sent_success'), type: 'success' });
    } catch (error) {
      console.error("Error sending code:", error);
      notify({ message: t('security.send_code_error'), type: 'error' });
    } finally {
      setIsSendingCode(false);
    }
  };
  const handleGoogleSignIn = async () => {
    window.open(`https://accounts.google.com/o/oauth2/v2/auth?client_id=${process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}&redirect_uri=${process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_ADD_EMAIL}&response_type=code&scope=email%20profile&access_type=offline`)
    console.log("handleGoogleSignIn")
  }

  return (
    <div className="animate-fadeIn">
      <div className="flex flex-col items-center justify-center py-8">
        {!walletInfor?.email ? (
          <>
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            </div>
            
            <h2 className="text-xl font-semibold mb-2 text-center">
              {isLinked ? t('security.account_linked') : t('security.link_telegram_google')}
            </h2>
            
            <p className="text-gray-600 dark:text-gray-300 text-sm mb-6 text-center max-w-sm">
              {isLinked 
                ? t('security.account_linked_description')
                : t('security.link_account_description')}
            </p>

            {code ? (
              // Show Telegram Code input when code is present
              <div className="flex flex-col items-center justify-center py-8">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('security.telegram_code')}
                </label>
                <div className="flex items-center gap-4">
                  <div className="flex gap-2">
                    {telegramCode.map((digit, index) => (
                      <input
                        key={index}
                        id={`telegram-code-${index}`}
                        type="text"
                        value={digit}
                        onChange={(e) => handleTelegramCodeChange(index, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(index, e)}
                        onPaste={(e) => handlePaste(e)}
                        className="w-8 h-10 text-center bg-white dark:bg-transparent border-2 border-blue-500 text-gray-900 dark:text-white rounded-md text-base font-medium focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 shadow-sm dark:shadow-none transition-colors duration-300"
                        maxLength={1}
                      />
                    ))}
                  </div>
                  <button
                    onClick={handleSendCode}
                    disabled={isSendingCode}
                    className="px-3 py-1.5 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium rounded-md transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed min-w-[100px] h-10 whitespace-nowrap"
                  >
                    {isSendingCode ? (
                      <div className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        {t('security.sending')}
                      </div>
                    ) : (
                      t('security.send_code')
                    )}
                  </button>
                </div>
                {errorMsg && (
                  <div className="text-red-500 text-sm text-center mt-4">{errorMsg}</div>
                )}
                <button
                  onClick={handleLinkAccount}
                  disabled={isLinking}
                  className="mt-4 w-full h-12 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium text-lg rounded-full transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isLinking ? (
                    <div className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {t('security.linking')}
                    </div>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" />
                      </svg>
                      {t('security.link_now')}
                    </>
                  )}
                </button>
              </div>
            ) : (
              // Show Google Sign In button when no code is present
              <div>
                <div className="flex justify-center">
                  <button
                    onClick={handleGoogleSignIn}
                    className="w-64 h-10 bg-white dark:bg-transparent border-2 border-blue-500 text-gray-900 dark:text-white rounded-md text-base font-medium hover:bg-blue-50 dark:hover:bg-blue-900/30 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 shadow-sm dark:shadow-none transition-colors duration-300 flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="currentColor"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    {t('security.sign_in_with_google')}
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="w-full max-w-md">
            <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-4">
              <div className="flex flex-col gap-3">
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${walletInfor?.isActiveMail ? 'text-green-500' : 'text-yellow-500'} mr-2`} viewBox="0 0 20 20" fill="currentColor">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                  <span className={`text-sm ${walletInfor?.isActiveMail ? 'text-green-700 dark:text-green-400' : 'text-yellow-700 dark:text-yellow-400'}`}>
                    {walletInfor?.email} {!walletInfor?.isActiveMail && '(✗)'}
                  </span>
                </div>
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-purple-700 dark:text-purple-400 text-sm">
                    {walletInfor?.password ? t('security.password_set') : t('security.password_not_set')} {walletInfor?.password ? '✓' : '✗'}
                  </span>
                </div>
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-orange-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-orange-700 dark:text-orange-400 text-sm">
                    {walletInfor?.isGGAuth ? t('security.gg_auth_enabled') : t('security.gg_auth_disabled')} {walletInfor?.isGGAuth ? '✓' : '✗'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
