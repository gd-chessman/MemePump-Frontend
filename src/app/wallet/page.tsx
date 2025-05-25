"use client"
import { TelegramWalletService } from "@/services/api";
import { getInforWallet, getListBuyToken, getMyWallets } from "@/services/api/TelegramWalletService";
import { truncateString } from "@/utils/format";
import { useQuery } from "@tanstack/react-query";
import { ArrowDownToLine, ArrowUpFromLine, Badge, Copy, Edit, KeyIcon, PlusIcon } from "lucide-react";
import React, { useState, useRef, useEffect } from "react";
import { Wallet } from "../components/list-wallet";
import { useWallets } from "@/hooks/useWallets";
import { WalletTable } from "@/app/components/wallet/WalletTable";
import { useToast } from "@/ui/use-toast";
import { useAuth } from "@/hooks/useAuth";

interface Token {
    token_address: string;
    token_name: string;
    token_symbol: string;
    token_logo_url: string;
    token_decimals: number;
    token_balance: number;
    token_balance_usd: number;
    token_price_usd: number;
    token_price_sol: number;
    is_verified: boolean;
}

interface TokenListResponse {
    status: number;
    message: string;
    data: {
        wallet_address: string;
        tokens: Token[];
    };
}

export default function WalletPage() {
    const { toast } = useToast();
    const [showPrivateKeys, setShowPrivateKeys] = useState(false);
    const [showAddWallet, setShowAddWallet] = useState(false);
    const [showImportWallet, setShowImportWallet] = useState(false);
    const [walletName, setWalletName] = useState("");
    const [walletNickname, setWalletNickname] = useState("");
    const [selectedNetwork, setSelectedNetwork] = useState("EN");
    const [privateKey, setPrivateKey] = useState("");
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [wallets, setWallets] = useState<any[]>([]);
    const [copyNotification, setCopyNotification] = useState<{ show: boolean; address: string }>({ show: false, address: "" });

    const privateKeysRef = useRef<HTMLDivElement>(null);
    const addWalletRef = useRef<HTMLDivElement>(null);
    const importWalletRef = useRef<HTMLDivElement>(null);
    const { isAuthenticated } = useAuth();
    useEffect(() => {
        fetchWallets();
    }, []);

    const { data: myWallets, refetch: refetchInforWallets } = useQuery({
        queryKey: ["my-wallets"],
        queryFn: getMyWallets,
        enabled: isAuthenticated,
    });
    console.log("myWallets", myWallets)

    const { data: tokenList, refetch: refetchTokenList } = useQuery({
        queryKey: ["token-buy-list"],
        queryFn: getListBuyToken,
        enabled: isAuthenticated,
    });

    const assets = [
        {
            name: "Axie Infinity",
            symbol: "AXS",
            balance: "0.1788 mefun",
            price: "$0.0000",
            value: "$0.0000",
            address: "TG34JK...mnopqr",
            status: "online",
        },
        {
            name: "Decentraland",
            symbol: "MANA",
            balance: "0.2354 mefun",
            price: "$0.7500",
            value: "$0.0035",
            address: "DF56GH...ijklm",
            status: "offline",
        },
        {
            name: "Decentraland",
            symbol: "MANA",
            balance: "0.2354 mefun",
            price: "$0.7500",
            value: "$0.0035",
            address: "DF56GH...ijklm",
            status: "offline",
        },
        {
            name: "The Sandbox",
            symbol: "SAND",
            balance: "0.5120 mefun",
            price: "$0.0250",
            value: "$0.0005",
            address: "ZX12CD...qrstuv",
            status: "online",
        },
    ]

    const { data: walletInfor, refetch } = useQuery({
        queryKey: ["wallet-infor"],
        queryFn: getInforWallet,
        refetchInterval: 30000,
        staleTime: 30000,
    });
    const { data: listWallets, error } = useQuery({
        queryKey: ['my-wallets'],
        queryFn: getMyWallets,
    });
    console.log("listWallets", listWallets)
    const fetchWallets = async () => {
        try {
            const walletList = await TelegramWalletService.getMyWallets();
            setWallets(walletList);
        } catch (error) {
            console.error("Error fetching wallets:", error);
            setToastMessage("Failed to fetch wallets");
            setShowToast(true);
        }
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (showPrivateKeys && privateKeysRef.current && !privateKeysRef.current.contains(event.target as Node)) {
                handleClosePrivateKeys();
            }
            if (showAddWallet && addWalletRef.current && !addWalletRef.current.contains(event.target as Node)) {
                handleCloseAddWallet();
            }
            if (showImportWallet && importWalletRef.current && !importWalletRef.current.contains(event.target as Node)) {
                handleCloseImportWallet();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showPrivateKeys, showAddWallet, showImportWallet]);

    const handleGetPrivateKeys = () => {
        setShowPrivateKeys(true);
    };

    const handleClosePrivateKeys = () => {
        setShowPrivateKeys(false);
    };

    const handleCloseAddWallet = () => {
        setShowAddWallet(false);
        setWalletName("");
        setWalletNickname("");
    };

    const handleImportWallet = () => {
        setShowImportWallet(true);
    };

    const handleCloseImportWallet = () => {
        setShowImportWallet(false);
        setWalletName("");
        setWalletNickname("");
        setPrivateKey("");
    };

    const handleAddWallet = async () => {
        try {
            setIsLoading(true);
            const walletData = {
                name: walletName,
                nick_name: walletNickname,
                country: selectedNetwork,
                type: "other",
            };

            await TelegramWalletService.addWallet(walletData);

            // Reset form and close modal
            setWalletName("");
            setWalletNickname("");
            setSelectedNetwork("EN");
            setShowAddWallet(false);

            // Show success message
            setToastMessage("Wallet added successfully");
            setShowToast(true);

            // Refresh wallet list
            await fetchWallets();
        } catch (error) {
            console.error("Error adding wallet:", error);
            setToastMessage("Failed to add wallet. Please try again.");
            setShowToast(true);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCopyAddress = (address: string, e: React.MouseEvent) => {
        e.stopPropagation();
        navigator.clipboard.writeText(address);
        setCopyNotification({ show: true, address });
        toast({
            title: "Address copied",
            description: "Wallet address has been copied to clipboard",
            duration: 2000,
        });
    };

    return (
        <div className="flex flex-col gap-6">
            <div className="container-body px-[40px] flex flex-col gap-6 pt-[30px] relative mx-auto z-10 ">
                {/* Wallet Cards Section */}
                <div className="grid grid-cols-4 gap-6 w-full">
                    <div className="px-6 py-4 border border-solid border-theme-secondary-500 rounded-xl flex flex-col justify-start items-center gap-4 min-w-0 bg-gradient-overlay">
                        <div className="inline-flex justify-start items-center gap-2 w-full">
                            <div className="w-8 h-8 relative overflow-hidden flex-shrink-0">
                                <img src="/solana.png" alt="Solana" className="w-full h-full object-cover" />
                            </div>
                            <div className="justify-start truncate">
                                <span className="text-Colors-Neutral-100 text-base font-semibold uppercase leading-tight">
                                    Solana
                                </span>
                                <span className="text-Colors-Neutral-100 text-base font-semibold leading-tight">
                                    {" "}
                                </span>
                                <span className="text-Colors-Neutral-100 text-base font-semibold uppercase leading-tight">
                                    Wallet
                                </span>
                            </div>
                        </div>
                        <div className="flex flex-col justify-start items-center gap-2 w-full">
                            <div className="w-full h-10 pl-4 pr-6 relative rounded-xl outline outline-1 outline-offset-[-1px] outline-purple-300 flex justify-between items-center">
                                <div className="justify-center text-Colors-Neutral-200 text-sm font-normal leading-tight truncate">
                                    {truncateString(walletInfor?.solana_address, 12)}
                                </div>
                                <div className="w-3.5 h-3.5 flex-shrink-0">
                                    <div className="w-3 h-3 bg-Colors-Neutral-100" />
                                </div>
                            </div>
                            <div className="justify-center text-Colors-Neutral-200 text-xs font-normal leading-none truncate w-full text-center">
                                {truncateString(listWallets?.[0]?.eth_address, 17)}
                            </div>
                        </div>
                    </div>

                    {/* ETH Wallet Card */}
                    <div className="px-6 py-4 bg-gradient-blue-transparent rounded-xl border border-solid border-theme-primary-100 flex flex-col justify-start items-center gap-4 min-w-0">
                        <div className="inline-flex justify-start items-center gap-2 w-full">
                            <div className="w-8 h-8 bg-theme-primary-500 rounded-full flex justify-center items-center relative overflow-hidden flex-shrink-0">
                                <img src="/ethereum.png" alt="Ethereum" className="w-4 h-4 object-cover" />
                            </div>
                            <div className="justify-start truncate">
                                <span className="text-Colors-Neutral-100 text-base font-semibold leading-tight">
                                    ETH{" "}
                                </span>
                                <span className="text-Colors-Neutral-100 text-base font-semibold uppercase leading-tight">
                                    Wallet
                                </span>
                            </div>
                        </div>
                        <div className="flex flex-col justify-start items-center gap-2 w-full">
                            <div className="w-full h-10 pl-4 pr-6 relative rounded-xl outline outline-1 outline-offset-[-1px] outline-indigo-500 flex justify-between items-center">
                                <div className="justify-center text-Colors-Neutral-200 text-sm font-normal leading-tight truncate">
                                    {truncateString(listWallets?.[0]?.eth_address, 17)}
                                </div>
                                <div className="w-3.5 h-3.5 flex-shrink-0">
                                    <div className="w-3 h-3 bg-Colors-Neutral-100" />
                                </div>
                            </div>
                            <div className="justify-center text-Colors-Neutral-200 text-xs font-normal leading-none truncate w-full text-center">
                                FsXqRL3Dch...VansCmGCPAeLuW4
                            </div>
                        </div>
                    </div>
                    <div className="px-6 py-4 bg-gradient-yellow-transparent rounded-xl border border-solid border-theme-yellow-300 flex flex-col justify-start items-center gap-4 min-w-0">
                        <div className="inline-flex justify-start items-center gap-2 w-full">
                            <div className="w-8 h-8 relative overflow-hidden flex-shrink-0">
                                <img src="/bnb.png" alt="BNB" className="w-full h-full object-cover" />
                            </div>
                            <div className="justify-start truncate">
                                <span className="text-Colors-Neutral-100 text-base font-semibold leading-tight">
                                    BNB{" "}
                                </span>
                                <span className="text-Colors-Neutral-100 text-base font-semibold uppercase leading-tight">
                                    Wallet
                                </span>
                            </div>
                        </div>
                        <div className="flex flex-col justify-start items-center gap-2 w-full">
                            <div className="w-full h-10 pl-4 pr-6 relative rounded-xl outline outline-1 outline-offset-[-1px] outline-amber-400 flex justify-between items-center">
                                <div className="justify-center text-Colors-Neutral-200 text-sm font-normal leading-tight truncate">
                                    {truncateString(listWallets?.[0]?.eth_address, 17)}
                                </div>
                                <div className="w-3.5 h-3.5 flex-shrink-0">
                                    <div className="w-3 h-3 bg-Colors-Neutral-100" />
                                </div>
                            </div>
                            <div className="justify-center text-Colors-Neutral-200 text-xs font-normal leading-none truncate w-full text-center">
                                FsXqRL3DchD...mGCPAeLuW4
                            </div>
                        </div>
                    </div>
                    <div className="px-6 py-4 bg-gradient-purple-transparent rounded-xl border border-solid border-theme-primary-300 flex flex-col justify-center items-center gap-4 min-w-0">
                        <div className="inline-flex justify-start items-center gap-2.5 w-full">
                            <img src="/ethereum.png" alt="Ethereum" className="w-4 h-4 object-cover" />
                            <div className="justify-start text-Colors-Neutral-100 text-base font-semibold uppercase leading-normal truncate">
                                Universal Account
                            </div>
                            <img src="/ethereum.png" alt="Ethereum" className="w-4 h-4 object-cover" />
                        </div>
                        <div className="flex flex-col sm:flex-row justify-start items-end gap-4 w-full">
                            <div className="flex flex-col justify-start items-start gap-3 min-w-0">
                                <div className="w-full flex flex-col justify-center items-start gap-1.5">
                                    <div className="text-right justify-start text-Colors-Neutral-100 text-2xl font-bold leading-9 truncate">
                                        {walletInfor?.solana_balance} SOL
                                    </div>
                                    <div className="inline-flex justify-start items-center gap-1.5 flex-wrap">
                                        <div className="text-right justify-start text-theme-primary-300 text-[16px] font-medium leading-relaxed">
                                            ${walletInfor?.solana_balance_usd}
                                        </div>
                                        <div className="text-right justify-start text-theme-primary-300 text-[16px] font-medium leading-relaxed">
                                            (0.00%)
                                        </div>
                                        <div className="text-right justify-start text-Colors-Neutral-100 text-[16px] font-medium leading-relaxed">
                                            24H
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="flex justify-end flex-1 items-center gap-3 w-full sm:w-auto">
                                <div className="flex flex-col justify-start items-center gap-1">
                                    <div className="w-8 h-8 gradient-overlay border border-neutral-200 rounded-full flex justify-center items-center top-[8px] ">
                                        <ArrowDownToLine className="w-4 h-4" />
                                    </div>
                                    <div className="text-center text-Colors-Neutral-100 text-[10px] font-semibold ">
                                        Receive
                                    </div>

                                </div>
                                <div className="flex flex-col justify-start items-center gap-1">
                                    <div data-property-1="Send" className="w-8 h-8 relative">

                                        <div className="w-8 h-8 gradient-overlay border border-neutral-200 rounded-full flex justify-center items-center top-[8px] ">
                                            <ArrowUpFromLine className="w-4 h-4" />
                                        </div>
                                    </div>
                                    <div className="text-center text-Colors-Neutral-100 text-[10px] font-semibold ">
                                        Send
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-center items-center my-2">
                    <button
                        onClick={handleGetPrivateKeys}
                        className="px-4 py-1.5 bg-gradient-to-l from-blue-950 to-purple-600 rounded-3xl shadow-[0px_0px_4px_0px_rgba(178,176,176,0.25)] outline outline-1 outline-offset-[-1px] outline-blue-950 inline-flex justify-center items-center gap-2.5"
                    >
                        <div className="w-3 h-3 relative overflow-hidden">
                            <KeyIcon className="w-3 h-3" />
                        </div>
                        <div className="justify-start text-Colors-Neutral-100 text-sm font-medium capitalize leading-tight">
                            Get Private Key
                        </div>
                    </button>
                </div>

                {/* Wallet Management Section */}
                <div className="self-stretch inline-flex justify-between items-center w-full z-10">
                    <div className="flex justify-start items-center gap-2.5">
                        <img src="/ethereum.png" alt="Ethereum" className="w-4 h-4 object-cover" />
                        <div className="justify-start text-Colors-Neutral-100 text-lg font-bold leading-relaxed">
                            SOLANA WALLET
                        </div>
                        <img src="/ethereum.png" alt="Ethereum" className="w-4 h-4 object-cover" />
                    </div>
                    <div className="flex justify-start items-center gap-6">
                        <button
                            onClick={() => setShowAddWallet(true)}
                            className="px-3 py-1.5 bg-gradient-to-l from-blue-950 to-purple-600 rounded-3xl shadow-[0px_0px_4px_0px_rgba(178,176,176,0.25)] outline outline-1 outline-offset-[-1px] outline-blue-950 flex justify-center items-center gap-2.5"
                        >
                            <div className="w-3 h-3 relative overflow-hidden">
                                <PlusIcon className="w-3 h-3" />
                            </div>
                            <div className="justify-start text-Colors-Neutral-100 text-sm font-medium capitalize leading-tight">
                                add Wallet
                            </div>
                        </button>
                        <button
                            onClick={handleImportWallet}
                            className="px-4 py-1.5 rounded-3xl shadow-[0px_0px_4px_0px_rgba(178,176,176,0.25)] outline outline-1 outline-offset-[-1px] outline-indigo-500 flex justify-center items-center gap-1.5"
                        >
                            <ArrowDownToLine className="w-4 h-4" />
                            <div className="justify-start text-Colors-Neutral-100 text-sm font-medium leading-tight">
                                Import wallet
                            </div>
                        </button>
                    </div>
                </div>

                {/* New Wallet Table */}
                <WalletTable
                    wallets={myWallets}
                    onCopyAddress={handleCopyAddress}
                    onUpdateWallet={refetchInforWallets}
                />

                {/* Assets Section */}
                <div className="flex justify-start items-center gap-2.5">
                    <img src="/ethereum.png" alt="Ethereum" className="w-4 h-4 object-cover" />
                    <div className="justify-start text-Colors-Neutral-100 text-lg font-bold leading-relaxed">
                        ASSETS
                    </div>
                    <img src="/ethereum.png" alt="Ethereum" className="w-4 h-4 object-cover" />
                </div>

                {/* Assets Table */}
                <div className="overflow-hidden rounded-xl border-1 z-10 border-solid border-y-[#15DFFD] border-x-[#720881]">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-900">
                                <tr>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Token ▼</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Balance</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Price</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Value</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Address</th>
                                </tr>
                            </thead>
                            <tbody>
                                {tokenList?.tokens.map((token: Token, index: number) => (
                                    <tr key={index} className="border-t border-gray-700">
                                        <td className="px-4 py-3 text-sm text-gray-300">
                                            <div className="flex items-center gap-2">
                                                {token.token_logo_url && (
                                                    <img
                                                        src={token.token_logo_url}
                                                        alt={token.token_name}
                                                        className="w-6 h-6 rounded-full"
                                                        onError={(e) => {
                                                            e.currentTarget.src = '/placeholder-token.png';
                                                        }}
                                                    />
                                                )}
                                                <div>
                                                    <div className="font-medium text-neutral-100">{token.token_name}</div>
                                                    <div className="text-xs text-gray-400">{token.token_symbol}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-300">
                                            {token.token_balance.toFixed(token.token_decimals)}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-300">
                                            ${token.token_price_usd.toFixed(6)}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-300">
                                            ${token.token_balance_usd.toFixed(6)}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-300">
                                            <div className="flex items-center gap-2">
                                                <span className="truncate max-w-[120px]">{token.token_address}</span>
                                                <button
                                                    onClick={(e) => handleCopyAddress(token.token_address, e)}
                                                    className="text-gray-400 hover:text-gray-200"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Modals */}
                {showPrivateKeys && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                        <div ref={privateKeysRef} className="p-6 bg-neutral-900 rounded-lg shadow-[0px_0px_4px_0px_rgba(232,232,232,0.50)] outline outline-1 outline-offset-[-1px] outline-indigo-500 backdrop-blur-[5px] inline-flex justify-start items-end gap-1">
                            <div className="w-96 inline-flex flex-col justify-start items-start gap-6">
                                <div className="self-stretch flex flex-col justify-start items-start gap-4">
                                    <div className="self-stretch inline-flex justify-between items-center">
                                        <div className="justify-start text-indigo-500 text-lg font-semibold uppercase leading-relaxed">Private Keys</div>
                                        <button
                                            onClick={handleClosePrivateKeys}
                                            className="w-5 h-5 relative overflow-hidden"
                                        >
                                            <div className="w-3 h-3 left-[4.17px] top-[4.16px] absolute bg-Colors-Neutral-200" />
                                        </button>
                                    </div>
                                    <div className="w-20 px-2 py-1 bg-Colors-Primary-Alpha-10/10 rounded-[30px] outline outline-1 outline-offset-[-1px] outline-Colors-Primary-500 backdrop-blur-[5px] inline-flex justify-center items-center gap-2.5">
                                        <div className="justify-start text-Colors-Primary-300 text-[10px] font-normal leading-none">Hide keys</div>
                                    </div>
                                    <div className="w-96 inline-flex justify-start items-center gap-6">
                                        <div className="flex-1 inline-flex flex-col justify-start items-start gap-1">
                                            <div className="self-stretch justify-center text-neutral-100 text-sm font-normal leading-tight">Solana Private Key</div>
                                            <div className="self-stretch h-10 pl-4 pr-6 relative rounded-xl outline outline-1 outline-offset-[-1px] outline-indigo-500 inline-flex justify-start items-center">
                                                <div className="w-80 justify-center text-Colors-Neutral-200 text-sm font-normal leading-tight truncate">2FpwHKZhkjNej7HmBRPszJNTaSzK1JsavL5Rnwef1x2SWNJpaNib7gmoj7jxJWKCqAn7fLLE96BN9AyB2Cfr3twC</div>
                                                <div className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 overflow-hidden">
                                                    <div className="w-3 h-3 left-[1.17px] top-[1.17px] absolute bg-Colors-Neutral-100" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="self-stretch flex flex-col justify-start items-start gap-1">
                                        <div className="self-stretch justify-center text-neutral-100 text-sm font-normal leading-tight">Ethereum Private Key</div>
                                        <div className="self-stretch h-10 pl-4 pr-6 relative rounded-xl outline outline-1 outline-offset-[-1px] outline-indigo-500 inline-flex justify-start items-center">
                                            <div className="w-80 justify-center text-Colors-Neutral-200 text-sm font-normal leading-tight truncate">2FpwHKZhkjNej7HmBRPszJNTaSzK1JsavL5Rnwef1x2SWNJpaNib7gmoj7jxJWKCqAn7fLLE96BN9AyB2Cfr3twC</div>
                                            <div className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 overflow-hidden">
                                                <div className="w-3 h-3 left-[1.17px] top-[1.17px] absolute bg-Colors-Neutral-100" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="self-stretch flex flex-col justify-start items-start gap-1">
                                        <div className="self-stretch justify-center text-neutral-100 text-sm font-normal leading-tight">BNB Private Key</div>
                                        <div className="self-stretch h-10 pl-4 pr-6 relative rounded-xl outline outline-1 outline-offset-[-1px] outline-indigo-500 inline-flex justify-start items-center">
                                            <div className="w-80 justify-center text-Colors-Neutral-200 text-sm font-normal leading-tight truncate">2FpwHKZhkjNej7HmBRPszJNTaSzK1JsavL5Rnwef1x2SWNJpaNib7gmoj7jxJWKCqAn7fLLE96BN9AyB2Cfr3twC</div>
                                            <div className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 overflow-hidden">
                                                <div className="w-3 h-3 left-[1.17px] top-[1.17px] absolute bg-Colors-Neutral-100" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="self-stretch inline-flex justify-center items-center gap-5">
                                    <button
                                        onClick={handleClosePrivateKeys}
                                        className="w-20 px-4 py-1.5 bg-gradient-to-l from-blue-950 to-purple-600 rounded-[30px] outline outline-1 outline-offset-[-1px] outline-indigo-500 backdrop-blur-sm flex justify-center items-center gap-3"
                                    >
                                        <div className="justify-start text-Colors-Neutral-100 text-sm font-medium leading-none">Close</div>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {showAddWallet && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                        <div ref={addWalletRef} className="bg-neutral-900 p-6 rounded-xl w-[400px] max-w-[90vw]">
                            <h2 className="text-xl font-semibold text-indigo-500 mb-4">Add New Wallet</h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-200 mb-1">Wallet Name</label>
                                    <input
                                        type="text"
                                        value={walletName}
                                        onChange={(e) => setWalletName(e.target.value)}
                                        className="w-full px-3 py-2 bg-white/10 border border-gray-600 rounded-lg text-neutral-100 focus:outline-none focus:border-purple-500"
                                        placeholder="Enter wallet name"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-200 mb-1">Nickname</label>
                                    <input
                                        type="text"
                                        value={walletNickname}
                                        onChange={(e) => setWalletNickname(e.target.value)}
                                        className="w-full px-3 py-2 bg-white/10 border border-gray-600 rounded-lg text-neutral-100 focus:outline-none focus:border-purple-500"
                                        placeholder="Enter nickname"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-200 mb-1">Network</label>
                                    <select
                                        value={selectedNetwork}
                                        onChange={(e) => setSelectedNetwork(e.target.value)}
                                        className="w-full px-3 py-2 bg-white/10 border border-gray-600 rounded-lg text-neutral-100 focus:outline-none focus:border-purple-500"
                                    >
                                        <option value="EN">English</option>
                                        <option value="VN">Vietnamese</option>
                                        <option value="CN">Chinese</option>
                                    </select>
                                </div>
                                <div className="flex justify-end gap-3 mt-6">
                                    <button
                                        onClick={handleCloseAddWallet}
                                        className="px-4 py-2 text-sm font-medium text-gray-200 hover:text-neutral-100"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleAddWallet}
                                        disabled={isLoading || !walletName || !walletNickname}
                                        className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-neutral-100 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isLoading ? "Adding..." : "Add Wallet"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {showImportWallet && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                        <div ref={importWalletRef} className="p-6 bg-neutral-900 rounded-lg shadow-[0px_0px_4px_0px_rgba(232,232,232,0.50)] outline outline-1 outline-offset-[-1px] outline-indigo-500 backdrop-blur-[5px] inline-flex justify-start items-end gap-1">
                            <div className="w-96 inline-flex flex-col justify-start items-start gap-6">
                                <div className="self-stretch flex flex-col justify-start items-start gap-4">
                                    <div className="self-stretch inline-flex justify-between items-center">
                                        <div className="justify-start text-indigo-500 text-lg font-semibold uppercase leading-relaxed">Import wallet</div>
                                        <button
                                            onClick={handleCloseImportWallet}
                                            className="w-5 h-5 relative overflow-hidden"
                                        >
                                            <div className="w-3 h-3 left-[4.17px] top-[4.16px] absolute bg-Colors-Neutral-200" />
                                        </button>
                                    </div>
                                    <div className="w-96 inline-flex justify-start items-center gap-6">
                                        <div className="flex-1 inline-flex flex-col justify-start items-start gap-1">
                                            <div className="self-stretch justify-center text-neutral-100 text-sm font-normal leading-tight">Wallet Name</div>
                                            <input
                                                type="text"
                                                value={walletName}
                                                onChange={(e) => setWalletName(e.target.value)}
                                                placeholder="Enter wallet name"
                                                className="self-stretch h-10 pl-4 pr-6 rounded-xl outline outline-1 outline-offset-[-1px] outline-indigo-500 bg-transparent text-Colors-Neutral-200 text-sm font-normal leading-tight w-full"
                                            />
                                        </div>
                                    </div>
                                    <div className="w-96 inline-flex justify-start items-center gap-6">
                                        <div className="flex-1 inline-flex flex-col justify-start items-start gap-1">
                                            <div className="self-stretch justify-center text-neutral-100 text-sm font-normal leading-tight">Solana Private Key</div>
                                            <div className="self-stretch h-10 pl-4 pr-6 relative rounded-xl outline outline-1 outline-offset-[-1px] outline-indigo-500 inline-flex justify-start items-center">
                                                <input
                                                    type="password"
                                                    value={privateKey}
                                                    onChange={(e) => setPrivateKey(e.target.value)}
                                                    placeholder="Enter Solana private key"
                                                    className="flex-1 bg-transparent text-Colors-Neutral-200 text-sm font-normal leading-tight outline-none"
                                                />
                                                <div className="flex gap-2">
                                                    <button className="w-3.5 h-3.5 relative overflow-hidden">
                                                        <div className="w-3 h-3 left-[1.17px] top-[1.17px] absolute bg-Colors-Neutral-100" />
                                                    </button>
                                                    <button className="w-3.5 h-3.5 relative overflow-hidden">
                                                        <div className="w-3 h-3 left-[1.31px] top-[0.84px] absolute bg-Colors-Neutral-100" />
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="self-stretch justify-center text-Colors-Neutral-200 text-[10px] font-normal leading-none">
                                                Your private key will be encrypted and stored securely
                                            </div>
                                        </div>
                                    </div>
                                    <div className="w-96 inline-flex justify-start items-center gap-6">
                                        <div className="flex-1 inline-flex flex-col justify-start items-start gap-1">
                                            <div className="self-stretch justify-center text-neutral-100 text-sm font-normal leading-tight">Wallet Nickname</div>
                                            <input
                                                type="text"
                                                value={walletNickname}
                                                onChange={(e) => setWalletNickname(e.target.value)}
                                                placeholder="Enter wallet nickname"
                                                className="self-stretch h-10 pl-4 pr-6 rounded-xl outline outline-1 outline-offset-[-1px] outline-indigo-500 bg-transparent text-Colors-Neutral-200 text-sm font-normal leading-tight w-full"
                                            />
                                        </div>
                                    </div>
                                    <div className="w-96 inline-flex justify-start items-center gap-6">
                                        <div className="flex-1 inline-flex flex-col justify-start items-start gap-1">
                                            <div className="self-stretch justify-center text-neutral-100 text-sm font-normal leading-tight">Network</div>
                                            <div className="self-stretch h-10 pl-4 pr-6 rounded-xl outline outline-1 outline-offset-[-1px] outline-indigo-500 inline-flex justify-between items-center">
                                                <div className="flex justify-start items-center gap-2">
                                                    <img className="w-4 h-4 rounded-full" src="https://placehold.co/18x18" alt="Network icon" />
                                                    <div className="text-center justify-start text-Colors-Neutral-100 text-sm font-medium leading-tight">{selectedNetwork}</div>
                                                </div>
                                                <div className="w-4 h-4 relative overflow-hidden">
                                                    <div className="w-2.5 h-1.5 left-[2.50px] top-[5px] absolute bg-neutral-50" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="self-stretch inline-flex justify-center items-center gap-5">
                                    <button
                                        onClick={handleCloseImportWallet}
                                        className="w-24 self-stretch px-4 py-1 rounded-[30px] outline outline-1 outline-offset-[-1px] outline-indigo-500 backdrop-blur-sm flex justify-center items-center gap-3"
                                    >
                                        <div className="justify-start text-Colors-Neutral-100 text-sm font-medium leading-none">Cancel</div>
                                    </button>
                                    <button
                                        onClick={() => {
                                            // Handle import wallet logic here
                                            handleCloseImportWallet();
                                        }}
                                        className="w-24 px-4 py-1.5 bg-gradient-to-l from-blue-950 to-purple-600 rounded-[30px] outline outline-1 outline-offset-[-1px] outline-indigo-500 backdrop-blur-sm flex justify-center items-center gap-3"
                                    >
                                        <div className="justify-start text-Colors-Neutral-100 text-sm font-medium leading-none">Import wallet</div>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Toast Notification */}
                {showToast && (
                    <div className="fixed bottom-4 right-4 bg-gradient-to-r from-purple-600 to-blue-600 text-neutral-100 px-6 py-3 rounded-lg shadow-lg z-50">
                        {toastMessage}
                    </div>
                )}
            </div>
        </div>
    );
}
