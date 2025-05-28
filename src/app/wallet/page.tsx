"use client"
import { TelegramWalletService } from "@/services/api";
import { getInforWallet, getListBuyToken, getMyWallets, getPrivate } from "@/services/api/TelegramWalletService";
import { formatNumberWithSuffix3, truncateString } from "@/utils/format";
import { useQuery } from "@tanstack/react-query";
import { ArrowDownToLine, ArrowUpFromLine, Badge, Copy, Edit, Eye, EyeOff, KeyIcon, PlusIcon } from "lucide-react";
import React, { useState, useRef, useEffect } from "react";
import { WalletTable } from "@/app/components/wallet/WalletTable";
import { useToast } from "@/ui/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { langConfig, useLang } from "@/lang";
import { useRouter } from "next/navigation";

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

interface PrivateKeys {
    sol_private_key: string;
    eth_private_key: string;
    bnb_private_key: string;
}

interface TokenListResponse {
    status: number;
    message: string;
    data: {
        wallet_address: string;
        tokens: Token[];
    };
}

const wrapGradientStyle = "bg-gradient-to-t from-theme-purple-100 to-theme-gradient-linear-end p-[1px] relative w-full rounded-xl"

// Add responsive styles
const containerStyles = "lg:container-glow w-full px-4 sm:px-[40px] flex flex-col gap-4 sm:gap-6 pt-4 sm:pt-[30px] relative mx-auto z-10"
const walletGridStyles = "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 w-full"
const walletCardStyles = "px-4 sm:px-6 py-4 border border-solid border-theme-secondary-500 rounded-xl flex flex-col justify-start items-center gap-3 sm:gap-4 min-w-0 bg-gradient-overlay"
const walletTitleStyles = "text-Colors-Neutral-100 text-sm sm:text-base font-semibold uppercase leading-tight"
const walletAddressStyles = "text-Colors-Neutral-200 text-xs sm:text-sm font-normal leading-tight truncate"
const sectionTitleStyles = "text-Colors-Neutral-100 text-base sm:text-lg font-bold leading-relaxed"
const tableContainerStyles = "overflow-x-auto -mx-4 sm:mx-0"
const tableStyles = "min-w-[800px] w-full"
const tableHeaderStyles = "px-3 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-medium text-gray-300"
const tableCellStyles = "px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-300"

// Add new styles for mobile assets
const assetCardStyles = "bg-theme-black-200/50 rounded-xl p-4 border border-solid border-y-[#15DFFD] border-x-[#720881]"
const assetHeaderStyles = "flex items-start gap-2 mb-3"
const assetTokenStyles = "flex items-center gap-2 flex-1 min-w-0"
const assetValueStyles = "text-right"
const assetLabelStyles = "text-xs text-gray-400 mb-1"
const assetAmountStyles = "text-sm sm:text-base font-medium text-neutral-100"
const assetPriceStyles = "text-xs sm:text-sm text-theme-primary-300"

export default function WalletPage() {
    const { t } = useLang();
    const { toast } = useToast();
    const [showPrivateKeys, setShowPrivateKeys] = useState(false);
    const [showAddWallet, setShowAddWallet] = useState(false);
    const [showImportWallet, setShowImportWallet] = useState(false);
    const [showCreatePassword, setShowCreatePassword] = useState(false);
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [passwordError, setPasswordError] = useState("");
    const [confirmPasswordError, setConfirmPasswordError] = useState("");
    const [walletName, setWalletName] = useState("");
    const [walletNickname, setWalletNickname] = useState("");
    const [selectedNetwork, setSelectedNetwork] = useState("EN");
    const router = useRouter();
    const [privateKey, setPrivateKey] = useState("");
    const [privateKeyDefault, setPrivateKeyDefault] = useState<PrivateKeys>({
        sol_private_key: "",
        eth_private_key: "",
        bnb_private_key: ""
    });
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [wallets, setWallets] = useState<any[]>([]);
    const [copyNotification, setCopyNotification] = useState<{ show: boolean; address: string }>({ show: false, address: "" });
    const [showPassword, setShowPassword] = useState({
        sol: false,
        eth: false,
        bnb: false
    });
    const [showPasswordInput, setShowPasswordInput] = useState(false);
    const [inputPassword, setInputPassword] = useState("");
    const [inputPasswordError, setInputPasswordError] = useState("");
    const [showInputPassword, setShowInputPassword] = useState(false);

    const privateKeysRef = useRef<HTMLDivElement>(null);
    const addWalletRef = useRef<HTMLDivElement>(null);
    const importWalletRef = useRef<HTMLDivElement>(null);
    const { isAuthenticated } = useAuth();
    const [privateKeys, setPrivateKeys] = useState<PrivateKeys>({
        sol_private_key: "",
        eth_private_key: "",
        bnb_private_key: ""
    });
    useEffect(() => {
        fetchWallets();
    }, []);

    const { data: myWallets, refetch: refetchInforWallets } = useQuery({
        queryKey: ["my-wallets"],
        queryFn: getMyWallets,
        enabled: isAuthenticated,
    });

    const { data: tokenList, refetch: refetchTokenList } = useQuery({
        queryKey: ["token-buy-list"],
        queryFn: getListBuyToken,
        enabled: isAuthenticated,
    });
    const { data: walletInfor, refetch } = useQuery({
        queryKey: ["wallet-infor"],
        queryFn: getInforWallet,
    });
    const { data: listWallets, error } = useQuery({
        queryKey: ['my-wallets'],
        queryFn: getMyWallets,
    });
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

    useEffect(() => {
        if (privateKeys) {
            setPrivateKeyDefault({
                sol_private_key: privateKeys.sol_private_key || "",
                eth_private_key: privateKeys.eth_private_key || "",
                bnb_private_key: privateKeys.bnb_private_key || ""
            });
        }
    }, [privateKeys]);

    const handleGetPrivateKeys = () => {
        if (walletInfor?.password) {
            setShowPasswordInput(true);
        } else {
            setShowCreatePassword(true);
        }
    };

    const handleClosePrivateKeys = () => {
        setShowPrivateKeys(false);
    };

    const handleCloseAddWallet = () => {
        setShowAddWallet(false);
        setWalletName("");
        setWalletNickname("");
    };


    const handleCloseImportWallet = () => {
        setShowImportWallet(false);
        setWalletName("");
        setWalletNickname("");
        setPrivateKey("");
    };

    const handleCloseCreatePassword = () => {
        setShowCreatePassword(false);
        setNewPassword("");
        setConfirmPassword("");
        setShowNewPassword(false);
        setShowConfirmPassword(false);
        setPasswordError("");
        setConfirmPasswordError("");
    };

    const validatePassword = (password: string) => {
        if (password.length < 8) {
            return "Password must be at least 8 characters long";
        }
        if (!/[A-Z]/.test(password)) {
            return "Password must contain at least one uppercase letter";
        }
        if (!/[a-z]/.test(password)) {
            return "Password must contain at least one lowercase letter";
        }
        if (!/[0-9]/.test(password)) {
            return "Password must contain at least one number";
        }
        if (!/[!@#$%^&*]/.test(password)) {
            return "Password must contain at least one special character (!@#$%^&*)";
        }
        return "";
    };

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setNewPassword(value);
        const error = validatePassword(value);
        setPasswordError(error);

        // Clear confirm password error if passwords match
        if (value === confirmPassword) {
            setConfirmPasswordError("");
        } else if (confirmPassword) {
            setConfirmPasswordError("Passwords do not match");
        }
    };

    const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setConfirmPassword(value);
        if (value !== newPassword) {
            setConfirmPasswordError("Passwords do not match");
        } else {
            setConfirmPasswordError("");
        }
    };

    const handleCreatePassword = async () => {
        // Validate both passwords
        const passwordValidationError = validatePassword(newPassword);
        if (passwordValidationError) {
            setPasswordError(passwordValidationError);
            return;
        }

        if (newPassword !== confirmPassword) {
            setConfirmPasswordError("Passwords do not match");
            return;
        }
        console.log("Creating password with:", newPassword);

        try {
            setIsLoading(true);
            // TODO: Call API to set password
            await TelegramWalletService.setPassword(newPassword);
            const res = await TelegramWalletService.getPrivate(newPassword);
            setPrivateKeys(res);
            toast({
                title: "Success",
                description: "Password created successfully",
                duration: 2000,
            });

            handleCloseCreatePassword();
            setShowPrivateKeys(true);
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to create password. Please try again.",
                duration: 2000,
            });
        } finally {
            setIsLoading(false);
        }
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

    const handleImportWallet = async () => {
        try {
            setIsLoading(true);
            const walletData = {
                name: walletName,
                nick_name: walletNickname,
                country: selectedNetwork,
                private_key: privateKey,
                type: "import",
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

    const handleClosePasswordInput = () => {
        setShowPasswordInput(false);
        setInputPassword("");
        setInputPasswordError("");
        setShowInputPassword(false);
    };

    const handleSubmitPassword = async () => {
        if (!inputPassword) {
            setInputPasswordError("Please enter your password");
            return;
        }

        try {
            setIsLoading(true);
            console.log("Calling getPrivate with input password:", inputPassword);
            const res = await TelegramWalletService.getPrivate(inputPassword);
            console.log("getPrivate response:", res);
            setPrivateKeys(res);
            setPrivateKeyDefault({
                sol_private_key: res.sol_private_key || "",
                eth_private_key: res.eth_private_key || "",
                bnb_private_key: res.bnb_private_key || ""
            });
            handleClosePasswordInput();
            setShowPrivateKeys(true);
        } catch (error) {
            console.error("Error getting private keys:", error);
            setInputPasswordError("Invalid password. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <div className="flex flex-col gap-4 sm:gap-6">
                <div className={containerStyles}>
                    {/* Wallet Cards Section */}
                    <div className={walletGridStyles}>
                        <div className={walletCardStyles}>
                            <div className="inline-flex justify-start items-center gap-2 w-full">
                                <div className="w-6 h-6 sm:w-8 sm:h-8 relative overflow-hidden flex-shrink-0">
                                    <img src="/solana.png" alt="Solana" className="w-full h-full object-cover" />
                                </div>
                                <div className="justify-start truncate">
                                    <span className={walletTitleStyles}>Solana</span>
                                    <span className={walletTitleStyles}> Wallet</span>
                                </div>
                            </div>
                            <div className="flex flex-col justify-start items-center gap-2 w-full">
                                <div className="w-full h-8 sm:h-10 pl-3 sm:pl-4 pr-4 sm:pr-6 relative rounded-xl outline outline-1 outline-offset-[-1px] outline-purple-300 flex justify-between items-center">
                                    <div className={walletAddressStyles}>
                                        {truncateString(walletInfor?.solana_address, 12)}
                                    </div>
                                    <div className="w-3 h-3 sm:w-3.5 sm:h-3.5 flex-shrink-0">
                                        <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-Colors-Neutral-100" />
                                    </div>
                                </div>
                                <div className={walletAddressStyles}>
                                    {truncateString(listWallets?.[0]?.eth_address, 17)}
                                </div>
                            </div>
                        </div>

                        {/* ETH Wallet Card */}
                        <div className={`${walletCardStyles} bg-gradient-blue-transparent border-theme-primary-100`}>
                            <div className="inline-flex justify-start items-center gap-2 w-full">
                                <div className="w-8 h-8 bg-theme-primary-500 rounded-full flex justify-center items-center relative overflow-hidden flex-shrink-0">
                                    <img src="/ethereum.png" alt="Ethereum" className="w-4 h-4 object-cover" />
                                </div>
                                <div className="justify-start truncate">
                                    <span className={walletTitleStyles}>ETH</span>
                                    <span className={walletTitleStyles}> Wallet</span>
                                </div>
                            </div>
                            <div className="flex flex-col justify-start items-center gap-2 w-full">
                                <div className="w-full h-10 pl-4 pr-6 relative rounded-xl outline outline-1 outline-offset-[-1px] outline-indigo-500 flex justify-between items-center">
                                    <div className={walletAddressStyles}>
                                        {truncateString(listWallets?.[0]?.eth_address, 17)}
                                    </div>
                                    <div className="w-3.5 h-3.5 flex-shrink-0">
                                        <div className="w-3 h-3 bg-Colors-Neutral-100" />
                                    </div>
                                </div>
                                <div className={walletAddressStyles}>
                                    FsXqRL3Dch...VansCmGCPAeLuW4
                                </div>
                            </div>
                        </div>
                        <div className={`${walletCardStyles} bg-gradient-yellow-transparent border-theme-yellow-300`}>
                            <div className="inline-flex justify-start items-center gap-2 w-full">
                                <div className="w-8 h-8 relative overflow-hidden flex-shrink-0">
                                    <img src="/bnb.png" alt="BNB" className="w-full h-full object-cover" />
                                </div>
                                <div className="justify-start truncate">
                                    <span className={walletTitleStyles}>BNB</span>
                                    <span className={walletTitleStyles}> Wallet</span>
                                </div>
                            </div>
                            <div className="flex flex-col justify-start items-center gap-2 w-full">
                                <div className="w-full h-10 pl-4 pr-6 relative rounded-xl outline outline-1 outline-offset-[-1px] outline-amber-400 flex justify-between items-center">
                                    <div className={walletAddressStyles}>
                                        {truncateString(listWallets?.[0]?.eth_address, 17)}
                                    </div>
                                    <div className="w-3.5 h-3.5 flex-shrink-0">
                                        <div className="w-3 h-3 bg-Colors-Neutral-100" />
                                    </div>
                                </div>
                                <div className={walletAddressStyles}>
                                    FsXqRL3DchD...mGCPAeLuW4
                                </div>
                            </div>
                        </div>
                        <div className={`${walletCardStyles} bg-gradient-purple-transparent border-theme-primary-300`}>
                            <div className="inline-flex justify-start items-center gap-2.5 w-full">
                                <img src="/ethereum.png" alt="Ethereum" className="w-4 h-4 object-cover" />
                                <div className="justify-start text-Colors-Neutral-100 text-base font-semibold uppercase leading-normal truncate">
                                    Universal Account
                                </div>
                                <img src="/ethereum.png" alt="Ethereum" className="w-4 h-4 object-cover" />
                            </div>
                            <div className="flex justify-between lg:justify-start lg:items-end gap-4 w-full">
                                <div className="flex flex-col justify-start items-start gap-3 min-w-0">
                                    <div className="w-full flex flex-col justify-center items-start gap-1.5">
                                        <div className="text-right justify-start text-Colors-Neutral-100 text-xl font-bold leading-9 truncate">
                                            {walletInfor?.solana_balance} SOL
                                        </div>
                                        <div className="inline-flex justify-start items-center gap-1.5 flex-wrap">
                                            <div className="text-right justify-start text-theme-primary-300 text-[16px] font-medium leading-relaxed">
                                                ${formatNumberWithSuffix3(walletInfor?.solana_balance_usd)}
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


                                        <button onClick={() => router.push('/universal-account')} className="flex flex-col justify-start items-center gap-0.5 md:gap-1">
                                            <div className="w-6 h-6 md:w-7 md:h-7 lg:w-8 lg:h-8 gradient-overlay border border-neutral-200 rounded-full flex justify-center items-center group  transition-all duration-500 hover:scale-105 hover:shadow-lg hover:shadow-theme-primary-500/30 active:scale-95">
                                                <ArrowDownToLine className="w-2.5 h-2.5 md:w-3 md:h-3 lg:w-4 lg:h-4" />
                                            </div>
                                            <div className="text-center text-Colors-Neutral-100 text-[9px] md:text-[10px] font-semibold">
                                                Receive
                                            </div>
                                        </button>

                                    </div>
                                    <div className="flex flex-col justify-start items-center gap-1">
                                        <button onClick={() => router.push('/universal-account')} className="flex flex-col justify-start items-center gap-0.5 md:gap-1">
                                            <div className="w-6 h-6 md:w-7 md:h-7 lg:w-8 lg:h-8 gradient-overlay border border-neutral-200 rounded-full flex justify-center items-center transition-all hover:scale-105">
                                                <ArrowUpFromLine className="w-2.5 h-2.5 md:w-3 md:h-3 lg:w-4 lg:h-4" />
                                            </div>
                                            <div className="text-center text-Colors-Neutral-100 text-[9px] md:text-[10px] font-semibold">
                                                Send
                                            </div>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-center items-center mt-1">
                        <button
                            onClick={handleGetPrivateKeys}
                            className="px-3 sm:px-4 py-1 sm:py-1.5 bg-gradient-to-l from-blue-950 to-purple-600 rounded-3xl shadow-[0px_0px_4px_0px_rgba(178,176,176,0.25)] outline outline-1 outline-offset-[-1px] outline-blue-950 inline-flex justify-center items-center gap-2 sm:gap-2.5"
                        >
                            <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 relative overflow-hidden">
                                <KeyIcon className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                            </div>
                            <div className="text-xs sm:text-sm font-medium capitalize leading-tight text-Colors-Neutral-100">
                                Get Private Key
                            </div>
                        </button>
                    </div>

                    {/* Wallet Management Section */}
                    <div className="self-stretch flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0 w-full z-10">
                        <div className="flex justify-start items-center gap-2 sm:gap-2.5">
                            <img src="/ethereum.png" alt="Ethereum" className="w-3 h-3 sm:w-4 sm:h-4 object-cover" />
                            <div className={sectionTitleStyles}>SOLANA WALLET</div>
                            <img src="/ethereum.png" alt="Ethereum" className="w-3 h-3 sm:w-4 sm:h-4 object-cover" />
                        </div>
                        <div className="flex flex-wrap justify-start items-center gap-3 sm:gap-6">
                            <button
                                onClick={() => setShowAddWallet(true)}
                                className="px-2 sm:px-3 pr-3 sm:pr-4 py-1 sm:py-1.5 bg-gradient-to-t from-blue-950 to-purple-600 rounded-3xl shadow-[0px_0px_4px_0px_rgba(178,176,176,0.25)] outline outline-1 outline-offset-[-1px] outline-blue-950 flex justify-center items-center gap-2 sm:gap-2.5"
                            >
                                <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 relative overflow-hidden">
                                    <PlusIcon className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                                </div>
                                <div className="text-xs sm:text-sm font-medium capitalize leading-tight text-Colors-Neutral-100">
                                    Add Wallet
                                </div>
                            </button>
                            <button
                                onClick={() => setShowImportWallet(true)}
                                className="px-3 sm:px-4 py-1 sm:py-1.5 rounded-3xl shadow-[0px_0px_4px_0px_rgba(178,176,176,0.25)] outline outline-1 outline-offset-[-1px] outline-indigo-500 flex justify-center items-center gap-1.5"
                            >
                                <ArrowDownToLine className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                <div className="text-xs sm:text-sm font-medium leading-tight text-Colors-Neutral-100">
                                    Import wallet
                                </div>
                            </button>
                        </div>
                    </div>

                    {/* Wallet Table */}
                    <div className="">
                        <WalletTable
                            wallets={myWallets}
                            onCopyAddress={handleCopyAddress}
                            onUpdateWallet={refetchInforWallets}
                        />
                    </div>

                    {/* Assets Section */}
                    <div className="flex justify-start items-center gap-2 sm:gap-2.5 mt-6 sm:mt-8">
                        <img src="/ethereum.png" alt="Ethereum" className="w-3 h-3 sm:w-4 sm:h-4 object-cover" />
                        <div className={sectionTitleStyles}>ASSETS</div>
                        <img src="/ethereum.png" alt="Ethereum" className="w-3 h-3 sm:w-4 sm:h-4 object-cover" />
                    </div>

                    {/* Assets Display - Table for desktop, Cards for mobile */}
                    <div className="">
                        {/* Desktop Table View */}
                        <div className="hidden sm:block overflow-hidden rounded-xl border-1 z-10 border-solid border-y-[#15DFFD] border-x-[#720881]">
                            <div className={tableContainerStyles}>
                                <table className={tableStyles}>
                                    <thead className="bg-gray-900">
                                        <tr>
                                            <th className={tableHeaderStyles}>Token ▼</th>
                                            <th className={tableHeaderStyles}>Balance</th>
                                            <th className={tableHeaderStyles}>Price</th>
                                            <th className={tableHeaderStyles}>Value</th>
                                            <th className={tableHeaderStyles}>Address</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {tokenList?.tokens?.map((token: Token, index: number) => (
                                            <tr key={index} className="border-t border-gray-700">
                                                <td className={tableCellStyles}>
                                                    <div className="flex items-center gap-2">
                                                        {token.token_logo_url && (
                                                            <img
                                                                src={token.token_logo_url}
                                                                alt={token.token_name}
                                                                className="w-5 h-5 sm:w-6 sm:h-6 rounded-full"
                                                                onError={(e) => {
                                                                    e.currentTarget.src = '/placeholder.png';
                                                                }}
                                                            />
                                                        )}
                                                        <div>
                                                            <div className="font-medium text-neutral-100 text-xs sm:text-sm">{token.token_name}</div>
                                                            <div className="text-[10px] sm:text-xs text-gray-400">{token.token_symbol}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className={tableCellStyles}>
                                                    {token.token_balance.toFixed(token.token_decimals)}
                                                </td>
                                                <td className={tableCellStyles}>
                                                    ${token.token_price_usd.toFixed(6)}
                                                </td>
                                                <td className={tableCellStyles}>
                                                    ${token.token_balance_usd.toFixed(6)}
                                                </td>
                                                <td className={tableCellStyles}>
                                                    <div className="flex items-center gap-2">
                                                        <span className="truncate max-w-[100px] sm:max-w-[120px]">{truncateString(token.token_address, 12)}</span>
                                                        <button
                                                            onClick={(e) => handleCopyAddress(token.token_address, e)}
                                                            className="text-gray-400 hover:text-gray-200"
                                                        >
                                                            <Copy className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Mobile Card View */}
                        <div className="sm:hidden space-y-3">
                            {tokenList?.tokens?.map((token: Token, index: number) => (
                                <div key={index} className={assetCardStyles}>
                                    {/* Token Info Header */}
                                    <div className={`w-fit ${assetHeaderStyles} flex-col `}>
                                        <div className={assetTokenStyles}>
                                            {token.token_logo_url && (
                                                <img
                                                    src={token.token_logo_url}
                                                    alt={token.token_name}
                                                    className="w-8 h-8 rounded-full"
                                                    onError={(e) => {
                                                        e.currentTarget.src = '/placeholder.png';
                                                    }}
                                                />
                                            )}
                                            <div className="min-w-0 flex gap-2">
                                                <div className="font-medium text-neutral-100 text-sm truncate">{token.token_name}</div>
                                                <div className="text-xs text-gray-400">{token.token_symbol}</div>
                                            </div>
                                        </div>
                                        {/* Token Address */}
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs text-neutral-200 truncate flex-1">
                                                {truncateString(token.token_address, 12)}
                                            </span>
                                            <button
                                                onClick={(e) => handleCopyAddress(token.token_address, e)}
                                                className="text-gray-400 hover:text-gray-200 p-1"
                                            >
                                                <Copy className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Token Details */}
                                    <div className="flex justify-between gap-3 mt-1 lg:mt-3 lg:pt-3 pt-1 border-t border-gray-700">
                                        <div>
                                            <div className={assetLabelStyles}>Balance</div>
                                            <div className={assetAmountStyles}>{token.token_balance.toFixed(token.token_decimals)}</div>
                                        </div>
                                        <div>
                                            <div className={assetLabelStyles}>Price</div>
                                            <div className={assetPriceStyles}>${token.token_price_usd.toFixed(6)}</div>
                                        </div>
                                        <div className={assetValueStyles}>
                                            <div className={assetLabelStyles}>Value</div>
                                            <div className={assetAmountStyles}>${token.token_balance_usd.toFixed(2)}</div>
                                        </div>
                                    </div>

                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Move modals outside the main container */}
            {showAddWallet && (
                <div className="fixed inset-0 bg-theme-black-1/3 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
                    <div className="p-[1px] rounded-xl bg-gradient-to-t from-theme-purple-100 to-theme-gradient-linear-end w-full max-w-[400px]">
                        <div ref={addWalletRef} className="bg-theme-black-200 border border-theme-gradient-linear-start p-4 sm:p-6 rounded-xl">
                            <h2 className="text-lg sm:text-xl font-semibold text-indigo-500 backdrop-blur-sm boxShadow linear-200-bg mb-4 text-fill-transparent bg-clip-text">Add New Wallet</h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-200 mb-1">Wallet Name</label>
                                    <div className={wrapGradientStyle}>
                                        <input
                                            type="text"
                                            value={walletName}
                                            onChange={(e) => setWalletName(e.target.value)}
                                            className="w-full px-3 py-2 bg-theme-black-200  rounded-xl text-neutral-100 focus:outline-none focus:border-purple-500"
                                            placeholder="Enter wallet name"
                                        />
                                    </div>

                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-200 mb-1">Nickname</label>
                                    <div className={wrapGradientStyle}>
                                        <input
                                            type="text"
                                            value={walletNickname}
                                            onChange={(e) => setWalletNickname(e.target.value)}
                                            className="w-full px-3 py-2 bg-theme-black-200 rounded-xl text-neutral-100 focus:outline-none focus:border-purple-500"
                                            placeholder="Enter nickname"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-200 mb-1">Network</label>
                                    <div className={wrapGradientStyle}>
                                        <select
                                            value={selectedNetwork}
                                            onChange={(e) => setSelectedNetwork(e.target.value)}
                                            className="w-full px-3 py-2 bg-theme-black-200 border-none rounded-xl text-neutral-100 focus:outline-none focus:border-purple-500"
                                        >
                                            {langConfig.listLangs.map((language) => (
                                                <option key={language.id} value={language.code}>{t(language.translationKey)}</option>
                                            ))}
                                        </select>
                                    </div>
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
                </div>
            )}

            {showPrivateKeys && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]">
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

                                <div className="w-96 inline-flex justify-start items-center gap-6">
                                    <div className="flex-1 inline-flex flex-col justify-start items-start gap-1">
                                        <div className="self-stretch justify-center text-neutral-100 text-sm font-normal leading-tight">Solana Private Key</div>
                                        <div className={wrapGradientStyle}>
                                            <div className="relative w-full">
                                                <input
                                                    type={showPassword.sol ? "text" : "password"}
                                                    value={privateKeyDefault.sol_private_key}
                                                    readOnly
                                                    placeholder="Enter Solana private key"
                                                    className="w-full text-xs placeholder:text-neutral-100 placeholder:text-xs px-3 py-2 bg-theme-black-200 rounded-xl text-neutral-100 focus:outline-none focus:border-purple-500 pr-10 cursor-default"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword(prev => ({ ...prev, sol: !prev.sol }))}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200"
                                                >
                                                    {showPassword.sol ? (
                                                        <EyeOff className="w-4 h-4" />
                                                    ) : (
                                                        <Eye className="w-4 h-4" />
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="self-stretch flex flex-col justify-start items-start gap-1">
                                    <div className="self-stretch justify-center text-neutral-100 text-sm font-normal leading-tight">Ethereum Private Key</div>
                                    <div className={wrapGradientStyle}>
                                        <div className="relative w-full">
                                            <input
                                                type={showPassword.eth ? "text" : "password"}
                                                value={privateKeyDefault.eth_private_key}
                                                readOnly
                                                placeholder="Enter Ethereum private key"
                                                className="w-full text-xs placeholder:text-neutral-100 placeholder:text-xs px-3 py-2 bg-theme-black-200 rounded-xl text-neutral-100 focus:outline-none focus:border-purple-500 pr-10 cursor-default"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(prev => ({ ...prev, eth: !prev.eth }))}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200"
                                            >
                                                {showPassword.eth ? (
                                                    <EyeOff className="w-4 h-4" />
                                                ) : (
                                                    <Eye className="w-4 h-4" />
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <div className="self-stretch flex flex-col justify-start items-start gap-1">
                                    <div className="self-stretch justify-center text-neutral-100 text-sm font-normal leading-tight">BNB Private Key</div>
                                    <div className={wrapGradientStyle}>
                                        <div className="relative w-full">
                                            <input
                                                type={showPassword.bnb ? "text" : "password"}
                                                value={privateKeyDefault.bnb_private_key}
                                                readOnly
                                                placeholder="Enter BNB private key"
                                                className="w-full text-xs placeholder:text-neutral-100 placeholder:text-xs px-3 py-2 bg-theme-black-200 rounded-xl text-neutral-100 focus:outline-none focus:border-purple-500 pr-10 cursor-default"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(prev => ({ ...prev, bnb: !prev.bnb }))}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200"
                                            >
                                                {showPassword.bnb ? (
                                                    <EyeOff className="w-4 h-4" />
                                                ) : (
                                                    <Eye className="w-4 h-4" />
                                                )}
                                            </button>
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

            {showImportWallet && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]">
                    <div className="p-[1px] rounded-xl bg-gradient-to-t from-theme-purple-100 to-theme-gradient-linear-end">
                        <div ref={importWalletRef} className="p-6 bg-theme-black-200 rounded-xl  shadow-[0px_0px_4px_0px_rgba(232,232,232,0.50)] outline outline-1 outline-offset-[-1px] outline-indigo-500 backdrop-blur-[5px] inline-flex justify-start items-end gap-1">
                            <div className="w-96 inline-flex flex-col justify-start items-start gap-6">
                                <div className="self-stretch flex flex-col justify-start items-start gap-4">
                                    <div className="self-stretch inline-flex justify-between items-center">
                                        <div className="text-xl font-semibold text-indigo-500 backdrop-blur-sm boxShadow linear-200-bg uppercase leading-relaxed text-fill-transparent bg-clip-text">Import wallet</div>
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
                                            <div className={wrapGradientStyle}>
                                                <input
                                                    type="text"
                                                    value={walletName}
                                                    onChange={(e) => setWalletName(e.target.value)}
                                                    placeholder="Enter wallet name"
                                                    className="w-full px-3 py-2 bg-theme-black-200  rounded-xl text-neutral-100 focus:outline-none focus:border-purple-500"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="w-96 inline-flex justify-start items-center gap-6">
                                        <div className="flex-1 inline-flex flex-col justify-start items-start gap-1">
                                            <div className="self-stretch justify-center text-neutral-100 text-sm font-normal leading-tight">Solana Private Key</div>
                                            <div className={wrapGradientStyle}>
                                                <div className="relative w-full">
                                                    <input
                                                        type={showPassword.sol ? "text" : "password"}
                                                        value={privateKey}
                                                        onChange={(e) => setPrivateKey(e.target.value)}
                                                        placeholder="Enter Solana private key"
                                                        className="w-full px-3 py-2 bg-theme-black-200 rounded-xl text-neutral-100 focus:outline-none focus:border-purple-500 pr-10"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowPassword(prev => ({ ...prev, sol: !prev.sol }))}
                                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200"
                                                    >
                                                        {showPassword.sol ? (
                                                            <EyeOff className="w-4 h-4" />
                                                        ) : (
                                                            <Eye className="w-4 h-4" />
                                                        )}
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
                                            <div className={wrapGradientStyle}>
                                                <input
                                                    type="text"
                                                    value={walletNickname}
                                                    onChange={(e) => setWalletNickname(e.target.value)}
                                                    placeholder="Enter wallet nickname"
                                                    className="w-full px-3 py-2 bg-theme-black-200  rounded-xl text-neutral-100 focus:outline-none focus:border-purple-500"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="w-full">
                                        <label className="block text-sm font-medium text-gray-200 mb-1">Network</label>
                                        <div className={wrapGradientStyle}>
                                            <select
                                                value={selectedNetwork}
                                                onChange={(e) => setSelectedNetwork(e.target.value)}
                                                className="w-full px-3 py-2 bg-theme-black-200 border-none rounded-xl text-neutral-100 focus:outline-none focus:border-purple-500"
                                            >
                                                {langConfig.listLangs.map((language) => (
                                                    <option key={language.id} value={language.code}>{t(language.translationKey)}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>
                                <div className="self-stretch inline-flex justify-center items-center gap-5">
                                    <button
                                        onClick={handleCloseImportWallet}
                                        className="w-30 h-[30px] self-stretch px-4 py-1 rounded-[30px] outline outline-1 outline-offset-[-1px] outline-indigo-500 backdrop-blur-sm flex justify-center items-center gap-3"
                                    >
                                        <div className="justify-start text-Colors-Neutral-100 text-sm font-medium leading-none">Cancel</div>
                                    </button>
                                    <button
                                        onClick={handleImportWallet}
                                        disabled={isLoading || !walletName || !walletNickname || !privateKey}
                                        className="w-30 h-[30px] px-4 py-1.5 bg-gradient-to-l from-blue-950 to-purple-600 rounded-[30px] outline outline-1 outline-offset-[-1px] outline-indigo-500 backdrop-blur-sm flex justify-center items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <div className="justify-start text-Colors-Neutral-100 text-sm font-medium leading-none">Import wallet</div>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {showCreatePassword && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]">
                    <div className="p-[1px] rounded-xl bg-gradient-to-t from-theme-purple-100 to-theme-gradient-linear-end">
                        <div className="p-6 bg-theme-black-200 rounded-xl shadow-[0px_0px_4px_0px_rgba(232,232,232,0.50)] outline outline-1 outline-offset-[-1px] outline-indigo-500 backdrop-blur-[5px] inline-flex justify-start items-end gap-1">
                            <div className="w-96 inline-flex flex-col justify-start items-start gap-6">
                                <div className="self-stretch flex flex-col justify-start items-start gap-4">
                                    <div className="self-stretch inline-flex justify-between items-center">
                                        <div className="text-[18px] font-semibold text-indigo-500 backdrop-blur-sm boxShadow linear-200-bg uppercase leading-relaxed text-fill-transparent bg-clip-text">Create Password</div>
                                        <button
                                            onClick={handleCloseCreatePassword}
                                            className="w-5 h-5 relative overflow-hidden"
                                        >
                                            <div className="w-3 h-3 left-[4.17px] top-[4.16px] absolute bg-Colors-Neutral-200" />
                                        </button>
                                    </div>

                                    <div className="w-96 inline-flex justify-start items-center gap-6">
                                        <div className="flex-1 inline-flex flex-col justify-start items-start gap-1">
                                            <div className="self-stretch justify-center text-neutral-100 text-sm font-normal leading-tight">New Password</div>
                                            <div className={wrapGradientStyle}>
                                                <div className="relative w-full">
                                                    <input
                                                        type={showNewPassword ? "text" : "password"}
                                                        value={newPassword}
                                                        onChange={handlePasswordChange}
                                                        placeholder="Enter new password"
                                                        className={`w-full px-3 py-2 bg-theme-black-200 rounded-xl text-neutral-100 focus:outline-none focus:border-purple-500 pr-10 ${passwordError ? 'border-red-500' : ''}`}
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowNewPassword(!showNewPassword)}
                                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200"
                                                    >
                                                        {showNewPassword ? (
                                                            <EyeOff className="w-4 h-4" />
                                                        ) : (
                                                            <Eye className="w-4 h-4" />
                                                        )}
                                                    </button>
                                                </div>
                                            </div>
                                            {passwordError && (
                                                <div className="text-red-500 text-xs mt-1">{passwordError}</div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="w-96 inline-flex justify-start items-center gap-6">
                                        <div className="flex-1 inline-flex flex-col justify-start items-start gap-1">
                                            <div className="self-stretch justify-center text-neutral-100 text-sm font-normal leading-tight">Confirm Password</div>
                                            <div className={wrapGradientStyle}>
                                                <div className="relative w-full">
                                                    <input
                                                        type={showConfirmPassword ? "text" : "password"}
                                                        value={confirmPassword}
                                                        onChange={handleConfirmPasswordChange}
                                                        placeholder="Confirm your password"
                                                        className={`w-full px-3 py-2 bg-theme-black-200 rounded-xl text-neutral-100 focus:outline-none focus:border-purple-500 pr-10 ${confirmPasswordError ? 'border-red-500' : ''}`}
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200"
                                                    >
                                                        {showConfirmPassword ? (
                                                            <EyeOff className="w-4 h-4" />
                                                        ) : (
                                                            <Eye className="w-4 h-4" />
                                                        )}
                                                    </button>
                                                </div>
                                            </div>
                                            {confirmPasswordError && (
                                                <div className="text-red-500 text-xs mt-1">{confirmPasswordError}</div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="self-stretch justify-center text-theme-primary-300 text-[10px] font-normal leading-3">
                                        (i) Password must be at least 8 characters long and contain uppercase, lowercase, number and special character.<br />
                                        &ensp;&nbsp; This password will be required to view your private keys in the future.
                                    </div>
                                </div>

                                <div className="self-stretch inline-flex justify-center items-center gap-5">
                                    <button
                                        onClick={handleCloseCreatePassword}
                                        className="w-30 h-[30px] self-stretch px-4 py-1 rounded-[30px] outline outline-1 outline-offset-[-1px] outline-indigo-500 backdrop-blur-sm flex justify-center items-center gap-3"
                                    >
                                        <div className="justify-start text-Colors-Neutral-100 text-sm font-medium leading-none">Cancel</div>
                                    </button>
                                    <button
                                        onClick={handleCreatePassword}
                                        disabled={isLoading || !newPassword || !confirmPassword}
                                        className="w-30 h-[30px] px-4 py-1.5 bg-gradient-to-l from-blue-950 to-purple-600 rounded-[30px] outline outline-1 outline-offset-[-1px] outline-indigo-500 backdrop-blur-sm flex justify-center items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <div className="justify-start text-Colors-Neutral-100 text-sm font-medium leading-none">
                                            {isLoading ? "Creating..." : "Create Password"}
                                        </div>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {showPasswordInput && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]">
                    <div className="p-[1px] rounded-xl bg-gradient-to-t from-theme-purple-100 to-theme-gradient-linear-end">
                        <div className="p-6 bg-theme-black-200 rounded-xl shadow-[0px_0px_4px_0px_rgba(232,232,232,0.50)] outline outline-1 outline-offset-[-1px] outline-indigo-500 backdrop-blur-[5px] inline-flex justify-start items-end gap-1">
                            <div className="w-96 inline-flex flex-col justify-start items-start gap-6">
                                <div className="self-stretch flex flex-col justify-start items-start gap-4">
                                    <div className="self-stretch inline-flex justify-between items-center">
                                        <div className="text-[18px] font-semibold text-indigo-500 backdrop-blur-sm boxShadow linear-200-bg uppercase leading-relaxed text-fill-transparent bg-clip-text">Enter Password</div>
                                        <button
                                            onClick={handleClosePasswordInput}
                                            className="w-5 h-5 relative overflow-hidden"
                                        >
                                            <div className="w-3 h-3 left-[4.17px] top-[4.16px] absolute bg-Colors-Neutral-200" />
                                        </button>
                                    </div>

                                    <div className="w-96 inline-flex justify-start items-center gap-6">
                                        <div className="flex-1 inline-flex flex-col justify-start items-start gap-1">
                                            <div className="self-stretch justify-center text-neutral-100 text-sm font-normal leading-tight">Password</div>
                                            <div className={wrapGradientStyle}>
                                                <div className="relative w-full">
                                                    <input
                                                        type={showInputPassword ? "text" : "password"}
                                                        value={inputPassword}
                                                        onChange={(e) => {
                                                            setInputPassword(e.target.value);
                                                            setInputPasswordError("");
                                                        }}
                                                        placeholder="Enter your password"
                                                        className={`w-full px-3 py-2 bg-theme-black-200 rounded-xl text-neutral-100 focus:outline-none focus:border-purple-500 pr-10 ${inputPasswordError ? 'border-red-500' : ''}`}
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowInputPassword(!showInputPassword)}
                                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200"
                                                    >
                                                        {showInputPassword ? (
                                                            <EyeOff className="w-4 h-4" />
                                                        ) : (
                                                            <Eye className="w-4 h-4" />
                                                        )}
                                                    </button>
                                                </div>
                                            </div>
                                            {inputPasswordError && (
                                                <div className="text-red-500 text-xs mt-1">{inputPasswordError}</div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="self-stretch justify-center text-theme-primary-300 text-[10px] font-normal leading-3">
                                        (i) Enter your password to view your private keys
                                    </div>
                                </div>

                                <div className="self-stretch inline-flex justify-center items-center gap-5">
                                    <button
                                        onClick={handleClosePasswordInput}
                                        className="w-30 h-[30px] self-stretch px-4 py-1 rounded-[30px] outline outline-1 outline-offset-[-1px] outline-indigo-500 backdrop-blur-sm flex justify-center items-center gap-3"
                                    >
                                        <div className="justify-start text-Colors-Neutral-100 text-sm font-medium leading-none">Cancel</div>
                                    </button>
                                    <button
                                        onClick={handleSubmitPassword}
                                        disabled={isLoading || !inputPassword}
                                        className="w-30 h-[30px] px-4 py-1.5 bg-gradient-to-l from-blue-950 to-purple-600 rounded-[30px] outline outline-1 outline-offset-[-1px] outline-indigo-500 backdrop-blur-sm flex justify-center items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <div className="justify-start text-Colors-Neutral-100 text-sm font-medium leading-none">
                                            {isLoading ? "Verifying..." : "Submit"}
                                        </div>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Toast Notification */}
            {showToast && (
                <div className="fixed bottom-4 right-4 left-4 sm:left-auto bg-gradient-to-r from-purple-600 to-blue-600 text-neutral-100 px-4 sm:px-6 py-2 sm:py-3 rounded-lg shadow-lg z-[9999] text-sm sm:text-base">
                    {toastMessage}
                </div>
            )}
        </>
    );
}
