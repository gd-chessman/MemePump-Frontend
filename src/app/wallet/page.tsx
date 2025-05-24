"use client"
import { KeyIcon, PlusIcon } from "lucide-react";
import React, { useState, useRef, useEffect } from "react";

export default function WalletPage() {
    const [showPrivateKeys, setShowPrivateKeys] = useState(false);
    const [showAddWallet, setShowAddWallet] = useState(false);
    const [showImportWallet, setShowImportWallet] = useState(false);
    const [walletName, setWalletName] = useState("");
    const [walletNickname, setWalletNickname] = useState("");
    const [selectedNetwork, setSelectedNetwork] = useState("EN");
    const [privateKey, setPrivateKey] = useState("");

    const privateKeysRef = useRef<HTMLDivElement>(null);
    const addWalletRef = useRef<HTMLDivElement>(null);
    const importWalletRef = useRef<HTMLDivElement>(null);

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

    const handleAddWallet = () => {
        setShowAddWallet(true);
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

    return (
        <div className="container-body px-[40px] flex flex-col gap-6 pt-[30px] relative mx-auto z-10">
            <div className="grid grid-cols-4 gap-4 w-full">
                <div className="px-6 py-4 bg-gradient-to-br from-blue-950/50 to-purple-600/50 rounded-xl outline outline-1 outline-offset-[-1px] outline-Colors-Secondary-300 backdrop-blur-[5px] flex flex-col justify-start items-center gap-4 min-w-0">
                    <div className="inline-flex justify-start items-center gap-2 w-full">
                        <div className="w-8 h-8 relative overflow-hidden flex-shrink-0">
                            <div className="w-8 h-8 left-0 top-0 absolute bg-gradient-to-l from-violet-900 to-violet-800" />
                            <div className="w-3.5 h-[2.86px] left-[8.68px] top-[18.88px] absolute bg-gradient-to-b from-teal-400 to-fuchsia-500" />
                            <div className="w-3.5 h-[2.87px] left-[8.70px] top-[10.26px] absolute bg-gradient-to-b from-teal-400 to-fuchsia-500" />
                            <div className="w-3.5 h-[2.86px] left-[8.70px] top-[14.54px] absolute bg-gradient-to-b from-teal-400 to-fuchsia-500" />
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
                                TG34....mnop
                            </div>
                            <div className="w-3.5 h-3.5 flex-shrink-0">
                                <div className="w-3 h-3 bg-Colors-Neutral-100" />
                            </div>
                        </div>
                        <div className="justify-center text-Colors-Neutral-200 text-xs font-normal leading-none truncate w-full text-center">
                            FsXqRL3DchD...sCmGCPAeLuW4
                        </div>
                    </div>
                </div>
                <div className="px-6 py-4 bg-gradient-to-l from-indigo-500/20 to-sky-500/20 rounded-xl outline outline-1 outline-offset-[-1px] outline-Colors-Primary-300 backdrop-blur-[5px] flex flex-col justify-start items-center gap-4 min-w-0">
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
                                TG34....mnop
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
                <div className="px-6 py-4 bg-gradient-to-br from-yellow-400/20 to-yellow-950/20 rounded-xl outline outline-1 outline-offset-[-1px] outline-Colors-Yellow-100 backdrop-blur-[5px] flex flex-col justify-start items-center gap-4 min-w-0">
                    <div className="inline-flex justify-start items-center gap-2 w-full">
                        <div className="w-8 h-8 relative overflow-hidden flex-shrink-0">
                            <div className="w-8 h-8 left-0 top-0 absolute bg-gradient-to-l from-yellow-600 to-amber-300" />
                            <div className="w-4 h-4 left-[7.06px] top-[7.06px] absolute bg-white" />
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
                                TG34....mnop
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
                <div className="px-6 py-4 bg-gradient-to-br from-blue-950/50 to-purple-600/50 rounded-xl outline outline-1 outline-offset-[-1px] outline-indigo-500 backdrop-blur-[5px] flex flex-col justify-center items-center gap-4 min-w-0">
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
                                    $1.1234
                                </div>
                                <div className="inline-flex justify-start items-center gap-1.5 flex-wrap">
                                    <div className="text-right justify-start text-Colors-Primary-300 text-lg font-medium leading-relaxed">
                                        $0
                                    </div>
                                    <div className="text-right justify-start text-Colors-Primary-300 text-lg font-medium leading-relaxed">
                                        (0.00%)
                                    </div>
                                    <div className="text-right justify-start text-Colors-Neutral-100 text-lg font-medium leading-relaxed">
                                        24H
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-between items-center gap-2 w-full sm:w-auto">
                            <div className="flex flex-col justify-start items-center gap-1">
                                <div data-property-1="Receive" className="w-8 h-8 relative">
                                    <div className="w-8 h-8 left-0 top-0 absolute bg-gradient-to-br from-blue-950/50 to-purple-600/50 rounded-full border border-Colors-Neutral-700" />
                                    <div className="w-4 h-4 left-[8px] top-[8px] absolute overflow-hidden">
                                        <div className="w-4 h-1.5 left-[0.40px] top-[9.97px] absolute bg-Colors-Neutral-200" />
                                        <div className="w-2 h-2.5 left-[3.75px] top-[0.57px] absolute bg-Colors-Neutral-200" />
                                    </div>
                                </div>
                                <div className="text-center text-Colors-Neutral-100 text-[10px] font-semibold leading-none">
                                    Receive
                                </div>
                            </div>
                            <div className="flex flex-col justify-start items-center gap-1">
                                <div data-property-1="Send" className="w-8 h-8 relative">
                                    <div className="w-8 h-8 left-0 top-0 absolute bg-gradient-to-br from-blue-950/50 to-purple-600/50 rounded-full border border-Colors-Neutral-700" />
                                    <div className="w-4 h-4 left-[8px] top-[8px] absolute overflow-hidden">
                                        <div className="w-4 h-1.5 left-[0.40px] top-[9.97px] absolute bg-Colors-Neutral-200" />
                                        <div className="w-2 h-2.5 left-[3.75px] top-[0.57px] absolute bg-Colors-Neutral-200" />
                                    </div>
                                </div>
                                <div className="text-center text-Colors-Neutral-100 text-[10px] font-semibold leading-none">
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

            <div className="self-stretch inline-flex justify-between items-center w-full">
                <div className="flex justify-start items-center gap-2.5">
                    <div className="w-5 h-5 relative overflow-hidden">
                        <div className="w-3.5 h-3.5 left-[3px] top-[3px] absolute bg-gradient-to-r from-cyan-400 to-sky-600" />
                    </div>
                    <div className="justify-start text-Colors-Neutral-100 text-lg font-bold leading-relaxed">
                        SOLANA WALLET
                    </div>
                    <div className="w-5 h-5 relative overflow-hidden">
                        <div className="w-3.5 h-3.5 left-[3px] top-[3px] absolute bg-gradient-to-r from-cyan-400 to-sky-600" />
                    </div>
                </div>
                <div className="flex justify-start items-center gap-6">
                    <button
                        onClick={handleAddWallet}
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
                        className="px-2 py-1.5 rounded-3xl shadow-[0px_0px_4px_0px_rgba(178,176,176,0.25)] outline outline-1 outline-offset-[-1px] outline-indigo-500 flex justify-center items-center gap-1.5"
                    >
                        <div className="w-3.5 h-3.5 relative overflow-hidden">
                            <div className="w-3 h-3 left-[1.17px] top-[1.17px] absolute bg-Colors-Neutral-100" />
                        </div>
                        <div className="justify-start text-Colors-Neutral-100 text-sm font-medium leading-tight">
                            Import wallet
                        </div>
                    </button>
                </div>
            </div>

            <div className="flex justify-start items-center gap-2.5">
                <div className="w-5 h-5 relative overflow-hidden">
                    <div className="w-3.5 h-3.5 left-[3px] top-[3px] absolute bg-gradient-to-r from-cyan-400 to-sky-600" />
                </div>
                <div className="justify-start text-Colors-Neutral-100 text-lg font-bold leading-relaxed">
                    ASSETS
                </div>
                <div className="w-5 h-5 relative overflow-hidden">
                    <div className="w-3.5 h-3.5 left-[3px] top-[3px] absolute bg-gradient-to-r from-cyan-400 to-sky-600" />
                </div>
            </div>


            {/* Popup Private Keys */}
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
                                        <div className="self-stretch justify-center text-white text-sm font-normal leading-tight">Solana Private Key</div>
                                        <div className="self-stretch h-10 pl-4 pr-6 relative rounded-xl outline outline-1 outline-offset-[-1px] outline-indigo-500 inline-flex justify-start items-center">
                                            <div className="w-80 justify-center text-Colors-Neutral-200 text-sm font-normal leading-tight truncate">2FpwHKZhkjNej7HmBRPszJNTaSzK1JsavL5Rnwef1x2SWNJpaNib7gmoj7jxJWKCqAn7fLLE96BN9AyB2Cfr3twC</div>
                                            <div className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 overflow-hidden">
                                                <div className="w-3 h-3 left-[1.17px] top-[1.17px] absolute bg-Colors-Neutral-100" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="self-stretch flex flex-col justify-start items-start gap-1">
                                    <div className="self-stretch justify-center text-white text-sm font-normal leading-tight">Ethereum Private Key</div>
                                    <div className="self-stretch h-10 pl-4 pr-6 relative rounded-xl outline outline-1 outline-offset-[-1px] outline-indigo-500 inline-flex justify-start items-center">
                                        <div className="w-80 justify-center text-Colors-Neutral-200 text-sm font-normal leading-tight truncate">2FpwHKZhkjNej7HmBRPszJNTaSzK1JsavL5Rnwef1x2SWNJpaNib7gmoj7jxJWKCqAn7fLLE96BN9AyB2Cfr3twC</div>
                                        <div className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 overflow-hidden">
                                            <div className="w-3 h-3 left-[1.17px] top-[1.17px] absolute bg-Colors-Neutral-100" />
                                        </div>
                                    </div>
                                </div>
                                <div className="self-stretch flex flex-col justify-start items-start gap-1">
                                    <div className="self-stretch justify-center text-white text-sm font-normal leading-tight">BNB Private Key</div>
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

            {/* Popup Private Keys */}

            {/* Popup Add Wallet */}
            {showAddWallet && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div ref={addWalletRef} className="p-6 bg-neutral-900 rounded-lg shadow-[0px_0px_4px_0px_rgba(232,232,232,0.50)] outline outline-1 outline-offset-[-1px] outline-indigo-500 backdrop-blur-[5px] inline-flex justify-start items-end gap-1">
                        <div className="w-96 relative inline-flex flex-col justify-start items-start gap-6">
                            <div className="self-stretch flex flex-col justify-start items-start gap-4">
                                <div className="self-stretch inline-flex justify-between items-center">
                                    <div className="justify-start text-indigo-500 text-lg font-semibold uppercase leading-relaxed">add new wallet</div>
                                    <button
                                        onClick={handleCloseAddWallet}
                                        className="w-5 h-5 relative overflow-hidden"
                                    >
                                        <div className="w-3 h-3 left-[4.17px] top-[4.16px] absolute bg-Colors-Neutral-200" />
                                    </button>
                                </div>
                                <div className="w-96 inline-flex justify-start items-center gap-6">
                                    <div className="flex-1 inline-flex flex-col justify-start items-start gap-1">
                                        <div className="self-stretch justify-center text-white text-sm font-normal leading-tight">Wallet Name</div>
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
                                        <div className="self-stretch justify-center text-white text-sm font-normal leading-tight">Wallet Nickname</div>
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
                                        <div className="self-stretch justify-center text-white text-sm font-normal leading-tight">Network</div>
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
                                    onClick={handleCloseAddWallet}
                                    className="w-24 self-stretch px-4 py-1 rounded-[30px] outline outline-1 outline-offset-[-1px] outline-indigo-500 backdrop-blur-sm flex justify-center items-center gap-3"
                                >
                                    <div className="justify-start text-Colors-Neutral-100 text-sm font-medium leading-none">Cancel</div>
                                </button>
                                <button
                                    onClick={() => {
                                        // Handle add wallet logic here
                                        handleCloseAddWallet();
                                    }}
                                    className="w-24 px-4 py-1.5 bg-gradient-to-l from-blue-950 to-purple-600 rounded-[30px] outline outline-1 outline-offset-[-1px] outline-indigo-500 backdrop-blur-sm flex justify-center items-center gap-3"
                                >
                                    <div className="justify-start text-Colors-Neutral-100 text-sm font-medium leading-none">Add Wallet</div>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Popup Add Wallet */}

            {/* Popup Import Wallet */}
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
                                        <div className="self-stretch justify-center text-white text-sm font-normal leading-tight">Wallet Name</div>
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
                                        <div className="self-stretch justify-center text-white text-sm font-normal leading-tight">Solana Private Key</div>
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
                                        <div className="self-stretch justify-center text-white text-sm font-normal leading-tight">Wallet Nickname</div>
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
                                        <div className="self-stretch justify-center text-white text-sm font-normal leading-tight">Network</div>
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

            {/* Popup Import Wallet */}
        </div>
    );
}
