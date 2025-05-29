'use client'
import React, { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { toast } from 'react-hot-toast';
import { Check, Copy, ExternalLink } from 'lucide-react';
import { useLang } from '@/lang/useLang';

interface DepositWalletProps {
    walletAddress: string;
}

const DepositWallet: React.FC<DepositWalletProps> = ({ walletAddress }) => {
    const [copied, setCopied] = useState(false);
    const { t } = useLang();

    const handleCopyAddress = () => {
        navigator.clipboard.writeText(walletAddress);
        setCopied(true);
        toast.success(t('universal_account.deposit_wallet.copy_success'));
    };
    
    return (
        <div>
            <div className="gap-5 flex flex-col justify-center items-center">
                <h3 className="text-sm font-bold text-center text-theme-neutral-100 mt-1">{t('universal_account.deposit_wallet.title')}</h3>

                {/* QR Code */}
                <div className="bg-white p-4 rounded-lg">
                    {walletAddress && (
                        <QRCodeSVG
                            value={walletAddress}
                            size={180}
                            bgColor={"#FFFFFF"}
                            fgColor={"#000000"}
                            level={"L"}
                        />
                    )}
                </div>

                {/* Address */}
                <div className="relative flex">
                    <div className="text-center rounded-lg p-3 text-sm text-gray-300 break-all">
                        {walletAddress}
                    </div>
                    <button
                        onClick={handleCopyAddress}
                        className=""
                    >
                        {copied ? <Check className="w-3 h-3 text-theme-green-200" /> : <Copy className="w-3 h-3" />}
                        <span className="sr-only">Copy address</span>
                    </button>
                </div>

                {/* Warning */}
                <div className="rounded-lg text-center">
                    <div className="flex justify-center mb-3">
                        <div className="w-6 h-6 rounded-full flex items-center justify-center text-2xl">⚠️</div>
                    </div>
                    <p className="text-sm text-theme-neutral-100">{t('universal_account.deposit_wallet.warning.title')}</p>
                    <p className="text-sm text-theme-neutral-100 mt-1">
                        {t('universal_account.deposit_wallet.warning.description')}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default DepositWallet; 