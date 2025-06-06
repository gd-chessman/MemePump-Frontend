"use client"

import { useState, useEffect } from "react"
import { Check, Copy } from "lucide-react"
import { toast } from 'react-hot-toast';
import React from "react";
import { truncateString } from "@/utils/format";
import { createTransaction, getTransactionHistory } from "@/services/api/HistoryTransactionWallet";
import { useLang } from "@/lang/useLang";
import { useQuery } from "@tanstack/react-query";
import { getInforWallet } from "@/services/api/TelegramWalletService";

export default function WithdrawWallet({ walletInfor }: { walletInfor: any }) {
  const { data: walletInforAccount, refetch: refetchWalletInforAccount } = useQuery({
    queryKey: ["wallet-infor"],
    queryFn: getInforWallet,
});
  const { data: transactions , refetch: refetchTransactions} = useQuery({
    queryKey: ["transactions"],
    queryFn: () => getTransactionHistory(),
});
  const { t } = useLang();
  const [amount, setAmount] = useState<string>("0")
  const [recipientWallet, setRecipientWallet] = useState<string>("")
  const [isSending, setIsSending] = useState<boolean>(false)
  const [error, setError] = useState<string>("")
  const [recipientError, setRecipientError] = useState<string>("")
  const [copied, setCopied] = useState(false);
  const [googleAuthCode, setGoogleAuthCode] = useState<string[]>(["", "", "", "", "", ""]);
  const [googleAuthError, setGoogleAuthError] = useState<string>("");

  // Kiểm tra điều kiện disable
  const isDisabled = React.useMemo(() => {
    const numAmount = Number.parseFloat(amount);
    const balance = parseFloat(walletInfor?.solana_balance || "0");

    const disabledConditions = {
      isSending,
      noWalletAddress: !walletInfor?.solana_address,
      amountTooSmall: numAmount < 0.001,
      amountTooLarge: numAmount > 1,
      exceedsBalance: numAmount > balance,
      hasError: !!error
    };

    console.log('Button disabled conditions:', {
      ...disabledConditions,
      recipientWalletEmpty: recipientWallet.length === 0,
      finalDisabled: isSending ||
        !walletInfor?.solana_address ||
        numAmount < 0.001 ||
        numAmount > 1 ||
        numAmount > balance ||
        !!error ||
        recipientWallet.length === 0
    });

    return {
      send: isSending ||
        !walletInfor?.solana_address ||
        numAmount < 0.001 ||
        numAmount > 1 ||
        numAmount > balance ||
        !!error,
      input: isSending,
      copy: isSending || !walletInfor?.solana_address
    };
  }, [amount, walletInfor, isSending, error, recipientWallet]);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isDisabled.input) return; // Không cho phép thay đổi khi đang sending

    const value = e.target.value;
    // Chỉ cho phép nhập số và dấu chấm
    if (/^\d*\.?\d*$/.test(value) || value === '') {
      // Kiểm tra nếu giá trị nhập vào lớn hơn 1
      const numValue = parseFloat(value);
      if (numValue > 1) {
        setAmount("1");
        setError("Maximum withdrawal amount is 1 SOL");
        return;
      }

      setAmount(value);

      // Validate amount against balance
      const balance = parseFloat(walletInfor?.solana_balance || "0");

      if (numValue > balance) {
        setError(`${t('universal_account.amount_cannot_exceed_balance', { balance })}`);
      } else if (numValue < 0.001 && value !== "") {
        setError(`${t('universal_account.minimum_withdrawal_amount', { amount: 0.001 })}`);
      } else if (numValue > 1) {
        setError(`${t('universal_account.maximum_withdrawal_amount', { amount: 1 })}`);
      } else {
        setError("");
      }
    }
  };

  console.log("walletInfor", walletInfor)

  const handleCopyAddress = () => {
    if (isDisabled.copy) return; // Không cho phép copy khi đang sending hoặc không có địa chỉ
    navigator.clipboard.writeText(walletInfor.solana_address);
    setCopied(true);
    toast.success('Wallet address copied to clipboard!');
    // Reset copied state after 2 seconds
    setTimeout(() => setCopied(false), 2000);
  };

  // Function to handle Google Auth code input
  const handleGoogleAuthChange = (index: number, value: string) => {
    if (value.length > 1) return; // Only allow single digit
    if (!/^\d*$/.test(value)) return; // Only allow numbers

    const newCode = [...googleAuthCode];
    newCode[index] = value;
    setGoogleAuthCode(newCode);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`google-auth-${index + 1}`);
      nextInput?.focus();
    }
  };

  // Function to handle Google Auth paste
  const handleGoogleAuthPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    if (!/^\d+$/.test(pastedData)) return;

    const newCode = pastedData.split('').concat(Array(6 - pastedData.length).fill(''));
    setGoogleAuthCode(newCode);
  };

  // Function to handle Google Auth keydown
  const handleGoogleAuthKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !googleAuthCode[index] && index > 0) {
      const prevInput = document.getElementById(`google-auth-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleSend = async () => {
    if (isDisabled.send) return;

    // Validate recipient wallet
    if (!recipientWallet.trim()) {
      setRecipientError(t('universal_account.recipient_address_required'));
      return;
    }

    // Validate Google Auth if required
    if (walletInforAccount?.isGGAuth) {
      const code = googleAuthCode.join('');
      if (code.length !== 6) {
        setGoogleAuthError(t('universal_account.google_auth_required'));
        return;
      }
      setGoogleAuthError("");
    }

    setRecipientError("");
    setIsSending(true);
    try {
      const response = await createTransaction({ 
        type: "withdraw", 
        amount: Number(amount), 
        wallet_address_to: recipientWallet,
        google_auth_token: walletInforAccount?.isGGAuth ? googleAuthCode.join('') : undefined
      });
      console.log("response", response)
      setAmount("0");
      setRecipientWallet("");
      setGoogleAuthCode(["", "", "", "", "", ""]);
      refetchTransactions();
      toast.success(t('universal_account.errors.transaction_success'));
    } catch (error: any) {
      // Handle different types of errors
      if (error.code === 'ERR_NETWORK') {
        toast.error(t('universal_account.errors.network_error'));
      } else if (error.response?.status === 401) {
        toast.error(t('universal_account.errors.unauthorized'));
      } else if (error.response?.data?.message === "User wallet not found") {
        toast.error(t('universal_account.errors.user_wallet_not_found'));
      } else if (error.response?.data?.message?.includes("Google Authenticator")) {
        toast.error(t('universal_account.errors.invalid_google_auth'));
        setGoogleAuthError(t('universal_account.errors.invalid_google_auth'));
      } else {
        toast.error(t('universal_account.errors.transaction_failed'));
      }
      console.error('Transaction error:', error);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 items-center">
      {/* Amount Input */}
      <div className={`p-[1px] rounded-xl bg-gradient-to-t from-theme-purple-100 to-theme-gradient-linear-end w-full max-w-[600px] group hover:from-theme-purple-200 hover:to-theme-gradient-linear-end transition-all duration-300 ${isDisabled.input ? 'opacity-50 cursor-not-allowed' : ''
        }`}>
        <div className="bg-white dark:bg-theme-black-200 border border-theme-gradient-linear-start p-4 sm:p-6 rounded-xl group-hover:border-theme-purple-200 transition-all duration-300 ">
          <div className="w-full">
            <div className="text-center mb-1">
              <p className="text-sm dark:text-gray-400 text-black group-hover:text-black dark:group-hover:text-white transition-colors duration-300">
                {isDisabled.input ? t('universal_account.transaction_progress') : t('universal_account.enter_amount')}
              </p>
            </div>
            <div className="text-center mb-2 relative">
              <input
                type="text"
                inputMode="decimal"
                value={amount}
                onChange={handleAmountChange}
                disabled={isDisabled.input}
                className={`bg-transparent text-center text-3xl max-w-[200px] font-bold w-full focus:outline-none transition-colors duration-300 ${error ? 'text-red-500' : 'group-hover:text-black dark:group-hover:text-white'
                  } ${isDisabled.input ? 'cursor-not-allowed opacity-50' : ''}`}
              />
              <span className={`absolute inset-y-0 right-0 flex items-center pr-3 transition-colors duration-300 ${error ? 'text-red-500' : 'text-gray-500 group-hover:text-gray-300'
                } ${isDisabled.input ? 'opacity-50' : ''}`}>SOL</span>
            </div>
            <div className="text-center text-xs text-gray-500 mb-1 group-hover:text-gray-400 transition-colors duration-300">
              {t('universal_account.available', { amount: walletInfor?.solana_balance })}
            </div>
            {error && (
              <div className="text-center text-xs text-red-500 mt-1">
                {error}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recipient Address */}
      <div className="w-full max-w-[600px] ">
        <label htmlFor="name" className={"block md:text-sm lg:text-base font-normal dark:text-neutral-100 text-black mb-1 text-xs"}>
          {t('universal_account.recipient_address')} <span className="text-theme-red-200">*</span>
        </label>
        <div className={`p-[1px] rounded-xl bg-gradient-to-t from-theme-purple-100 to-theme-gradient-linear-end w-full group hover:from-theme-purple-200 hover:to-theme-gradient-linear-end transition-all duration-300`}>
          <div className="bg-white dark:bg-theme-black-200 border border-theme-gradient-linear-start rounded-xl group-hover:border-theme-purple-200 transition-all duration-300">
            <input
              type="text"
              value={recipientWallet}
              onChange={(e) => setRecipientWallet(e.target.value)}
              // onPaste={(e) => {
              //   const pastedText = e.clipboardData.getData('text');
              //   setRecipientWallet(pastedText);
              // }}
              className="w-full bg-transparent h-10 rounded-xl pl-3 text-sm font-normal focus:outline-none transition-colors duration-300"
              placeholder={t('universal_account.recipient_placeholder')}
            />
          </div>
          {recipientError && (
            <div className="text-xs text-red-500 mt-1 pl-3">
              {recipientError}
            </div>
          )}
        </div>
      </div>

      {/* Google Authenticator Input */}
      {walletInforAccount?.isGGAuth && (
        <div className="w-full max-w-[600px]">
          <label className="block md:text-sm lg:text-base font-normal dark:text-neutral-100 text-black mb-1 text-xs">
            {t('universal_account.google_auth_code')} <span className="text-theme-red-200">*</span>
          </label>
          <div className="p-[1px] rounded-xl bg-gradient-to-t from-theme-purple-100 to-theme-gradient-linear-end w-full group hover:from-theme-purple-200 hover:to-theme-gradient-linear-end transition-all duration-300">
            <div className="bg-white dark:bg-theme-black-200 border border-theme-gradient-linear-start rounded-xl group-hover:border-theme-purple-200 transition-all duration-300 p-4">
              <div className="flex justify-center gap-2">
                {googleAuthCode.map((digit, index) => (
                  <input
                    key={index}
                    id={`google-auth-${index}`}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleGoogleAuthChange(index, e.target.value)}
                    onPaste={handleGoogleAuthPaste}
                    onKeyDown={(e) => handleGoogleAuthKeyDown(index, e)}
                    className="w-10 h-10 text-center text-lg font-bold border border-theme-blue-100 rounded-lg focus:outline-none focus:border-theme-blue-200"
                    disabled={isSending}
                  />
                ))}
              </div>
              {googleAuthError && (
                <div className="text-xs text-red-500 mt-2 text-center">
                  {googleAuthError}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Send Button */}
      <button
        onClick={handleSend}
        disabled={isDisabled.send || recipientWallet.length === 0}
        className={`lg:max-w-auto min-w-[160px] group relative bg-gradient-to-t from-theme-primary-500 to-theme-secondary-400 py-1.5 md:py-2 px-3 md:px-4 lg:px-6 rounded-full text-[11px] md:text-sm text-theme-neutral-100 transition-all duration-500 hover:from-theme-blue-100 hover:to-theme-blue-200 hover:scale-105 hover:shadow-lg hover:shadow-theme-primary-500/30 active:scale-95 w-full md:w-auto ${(isDisabled.send || recipientWallet.length === 0) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        {isSending ? (
          <span className="flex items-center gap-2">
            <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {t('universal_account.sending')}
          </span>
        ) : (
          t('universal_account.send')
        )}
      </button>
    </div>
  )
}
