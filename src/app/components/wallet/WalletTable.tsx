"use client"

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/ui/table";
import { Button } from "@/ui/button";
import { Copy, Edit, Check, X, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/ui/card";
import { Badge } from "@/ui/badge";
import { truncateString } from "@/utils/format";
import { Wallet } from "../list-wallet";
import { Input } from "@/ui/input";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import { TelegramWalletService } from '@/services/api';
import notify from "../notify";
import { getInforWallet, useWallet } from "@/services/api/TelegramWalletService";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/ui/dialog";
import { useLang } from "@/lang";

interface WalletData extends Wallet {
    wallet_nick_name: string;
    wallet_country: string;
    eth_address: string;
}

interface WalletTableProps {
    wallets: WalletData[];
    onCopyAddress?: (address: string, e: React.MouseEvent) => void;
    onUpdateWallet?: () => void;
}

const textTitle = 'text-neutral-800 dark:text-neutral-200 font-normal text-xs py-3'
const textContent = 'text-neutral-900 dark:text-neutral-100 text-xs font-normal py-3'

// Add new styles for mobile wallet cards only
const mobileStyles = {
    card: "sm:hidden dark:bg-theme-black-200/50 bg-white rounded-xl p-3 border border-solid border-y-theme-primary-100 border-x-theme-purple-200",
    header: "flex items-start justify-between gap-2 mb-2",
    nameContainer: "flex flex-col gap-1 min-w-0",
    label: "text-[10px] dark:text-gray-400 text-black",
    value: "text-xs font-medium dark:text-neutral-100 text-black",
    badge: "text-[10px] px-1.5 py-0.5 rounded-full",
    actionBar: "flex items-center gap-2 mt-2 pt-2 border-t border-gray-700",
    addressContainer: "space-y-2 mt-2",
    editButton: "h-5 w-5 p-0 hover:bg-neutral-700/50",
    copyButton: "h-6 w-6 p-0 hover:bg-neutral-700/50 flex-shrink-0",
    icon: "h-3 w-3"
}

export function WalletTable({ wallets, onCopyAddress, onUpdateWallet }: WalletTableProps) {
    const { toast } = useToast();
    const {t} = useLang();
    const { isAuthenticated, logout, updateToken } = useAuth();
    const [editingWalletId, setEditingWalletId] = useState<string | null>(null);
    const [editingField, setEditingField] = useState<'name' | 'nickname' | 'country' | null>(null);
    const [editingValue, setEditingValue] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [copiedAddress, setCopiedAddress] = useState<string | null>(null);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [walletToDelete, setWalletToDelete] = useState<WalletData | null>(null);

    const { data: walletInfor, refetch } = useQuery({
        queryKey: ["wallet-infor"],
        queryFn: getInforWallet,
    });
    const handleCopyAddress = (address: string, e: React.MouseEvent) => {
        e.stopPropagation();
        navigator.clipboard.writeText(address);
        setCopiedAddress(address);
        toast({
            title: t("wallet.copySuccess"),
            description: truncateString(address, 14),
        });
        onCopyAddress?.(address, e);

        // Reset copied state after 2 seconds
        setTimeout(() => {
            setCopiedAddress(null);
        }, 2000);
    };

    const handleStartEdit = (walletId: string, field: 'name' | 'nickname' | 'country', currentValue: string) => {
        setEditingWalletId(walletId);
        setEditingField(field);
        setEditingValue(currentValue);
    };

    const handleCancelEdit = () => {
        setEditingWalletId(null);
        setEditingField(null);
        setEditingValue('');
    };

    const handleChangeWallet = async (wallet: WalletData) => {
        try {
            const res = await useWallet({ wallet_id: wallet.wallet_id });
            updateToken(res.token);
            notify({
                message: 'Chuyển đổi ví thành công!',
                type: 'success'
            });
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        } catch (error) {
            console.error('Error changing wallet:', error);
            notify({
                message: 'Chuyển đổi ví thất bại!',
                type: 'error'
            });
        }
    };

    const handleDeleteClick = (wallet: WalletData, e: React.MouseEvent) => {
        e.stopPropagation();
        setWalletToDelete(wallet);
        setDeleteModalOpen(true);
    };

    const handleDeleteWallet = async (id: string) => {
        const walletData = { wallet_id: id };
        const res = await TelegramWalletService.deleteWallet(walletData);

    };


    const handleDeleteConfirm = async () => {
        if (!walletToDelete) return;

        try {
            // TODO: Implement delete wallet API call
            notify({
                message: 'Xóa ví thành công!',
                type: 'success'
            });
            onUpdateWallet?.();
        } catch (error) {
            console.error('Error deleting wallet:', error);
            notify({
                message: 'Xóa ví thất bại!',
                type: 'error'
            });
        } finally {
            setDeleteModalOpen(false);
            setWalletToDelete(null);
        }
    };

    const handleUpdateWallet = async () => {
        if (!editingWalletId || !editingField) return;

        setIsSubmitting(true);
        try {
            const currentWallet = wallets.find(w => w.wallet_id === editingWalletId);
            if (!currentWallet) return;

            // Check for duplicate nickname
            if (editingField === 'nickname') {
                const isDuplicate = wallets.some(
                    w => w.wallet_id !== editingWalletId && w.wallet_nick_name === editingValue
                );
                if (isDuplicate) {
                    toast({
                        title: t("wallet.nicknameDuplicate"),
                        variant: "destructive",
                    });
                    return;
                }
            }

            await TelegramWalletService.changeName({
                wallet_id: editingWalletId,
                name: editingField === 'name' ? editingValue : currentWallet.wallet_name,
                nick_name: editingField === 'nickname' ? editingValue : currentWallet.wallet_nick_name,
                country: editingField === 'country' ? editingValue : currentWallet.wallet_country,
            });

            toast({
                title: t("wallet.updateSuccess"),
            });
            onUpdateWallet?.();
        } catch (error) {
            toast({
                title: t("wallet.updateFailed"),
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
            handleCancelEdit();
        }
    };

    const renderMobileWalletCard = (wallet: WalletData) => (
        <div key={wallet.wallet_id} className={mobileStyles.card}>
            {/* Header with Name and Type */}
            <div className={mobileStyles.header}>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <div className={mobileStyles.nameContainer}>
                            <div className="flex items-center gap-2">
                                <span className={mobileStyles.value}>{wallet.wallet_name}</span>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className={mobileStyles.editButton}
                                    onClick={() => handleStartEdit(wallet.wallet_id, 'name', wallet.wallet_name)}
                                >
                                    <Edit className={mobileStyles.icon} />
                                </Button>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className={mobileStyles.value}>{wallet.wallet_nick_name}</span>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className={mobileStyles.editButton}
                                    onClick={() => handleStartEdit(wallet.wallet_id, 'nickname', wallet.wallet_nick_name)}
                                >
                                    <Edit className={mobileStyles.icon} />
                                </Button>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Badge
                            className={`${wallet.wallet_type === "main"
                                ? "dark:bg-green-900 bg-green-50 border-green-600 text-green-300"
                                : wallet.wallet_type === "import"
                                    ? "dark:bg-blue-900 bg-blue-50 border-blue-600 text-blue-300"
                                    : "dark:bg-gray-700 bg-gray-50 border-gray-600 text-gray-300"
                                } ${mobileStyles.badge}`}
                        >
                            {wallet.wallet_type.charAt(0).toUpperCase() + wallet.wallet_type.slice(1)}
                        </Badge>
                        <Badge
                            className={`${wallet.wallet_auth === "master"
                                ? "dark:bg-purple-900 bg-purple-50 border-purple-600 text-purple-300"
                                : "dark:bg-gray-700 bg-gray-50 border-[#15DFFD] text-[#15DFFD]"
                                } ${mobileStyles.badge}`}
                        >
                            {wallet.wallet_auth.charAt(0).toUpperCase() + wallet.wallet_auth.slice(1)}
                        </Badge>
                    </div>
                </div>
            </div>

            {/* Addresses */}
            <div className={mobileStyles.addressContainer}>
                <div>
                    <div className={mobileStyles.label}>Solana Address</div>
                    <div className="flex items-center gap-2">
                        <span className={`${mobileStyles.value} truncate flex-1`}>
                            {truncateString(wallet.solana_address, 12)}
                        </span>
                        <Button
                            variant="ghost"
                            size="icon"
                            className={mobileStyles.copyButton}
                            onClick={(e) => handleCopyAddress(wallet.solana_address, e)}
                        >
                            {copiedAddress === wallet.solana_address ? (
                                <Check className={`${mobileStyles.icon} text-green-500`} />
                            ) : (
                                <Copy className={mobileStyles.icon} />
                            )}
                        </Button>
                    </div>
                </div>
                <div>
                    <div className={mobileStyles.label}>ETH Address</div>
                    <div className="flex items-center gap-2">
                        <span className={`${mobileStyles.value} truncate flex-1`}>
                            {truncateString(wallet.eth_address, 12)}
                        </span>
                        <Button
                            variant="ghost"
                            size="icon"
                            className={mobileStyles.copyButton}
                            onClick={(e) => handleCopyAddress(wallet.eth_address, e)}
                        >
                            {copiedAddress === wallet.eth_address ? (
                                <Check className={`${mobileStyles.icon} text-green-500`} />
                            ) : (
                                <Copy className={mobileStyles.icon} />
                            )}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className={mobileStyles.actionBar}>
                <div className="flex items-center gap-2">
                    <div
                        className={`w-2 h-2 rounded-full ${walletInfor?.solana_address === wallet.solana_address
                            ? 'bg-theme-green-200 cursor-default'
                            : 'bg-neutral-200 hover:bg-theme-green-200 cursor-pointer'
                            }`}
                        onClick={() => walletInfor?.solana_address !== wallet.solana_address && handleChangeWallet(wallet)}
                    />
                    <span className={mobileStyles.value}>
                        {walletInfor?.solana_address === wallet.solana_address ? 'Active' : 'Switch'}
                    </span>
                </div>
                {wallet.wallet_type !== 'main' && walletInfor?.solana_address !== wallet.solana_address && (
                    <Button
                        variant="ghost"
                        size="icon"
                        className={`${mobileStyles.copyButton} hover:bg-red-700/50 ml-auto`}
                        onClick={(e) => handleDeleteClick(wallet, e)}
                    >
                        <Trash2 className={`${mobileStyles.icon} text-red-500`} />
                    </Button>
                )}
            </div>
        </div>
    );

    const renderEditableCell = (wallet: WalletData, field: 'name' | 'nickname' | 'country') => {
        const isEditing = editingWalletId === wallet.wallet_id && editingField === field;
        const value = field === 'name' ? wallet.wallet_name :
            field === 'nickname' ? wallet.wallet_nick_name :
                wallet.wallet_country;

        if (isEditing) {
            return (
                <div className="flex items-center gap-2">
                    <Input
                        value={editingValue}
                        onChange={(e) => setEditingValue(e.target.value)}
                        className="h-7 w-[140px] text-xs"
                        autoFocus
                    />
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 p-0 hover:bg-green-700/50"
                        onClick={handleUpdateWallet}
                        disabled={isSubmitting}
                    >
                        <Check className="h-4 w-4 text-green-500" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 p-0 hover:bg-red-700/50"
                        onClick={handleCancelEdit}
                        disabled={isSubmitting}
                    >
                        <X className="h-4 w-4 text-red-500" />
                    </Button>
                </div>
            );
        }

        return (
            <div className="flex items-center gap-3">
                <span className={field === 'country' ? 'uppercase' : ''}>{value}</span>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 p-0 hover:bg-neutral-700/50"
                    onClick={() => handleStartEdit(wallet.wallet_id, field, value)}
                >
                    <Edit className="h-4 w-4" />
                </Button>
            </div>
        );
    };

    return (
        <>
            <Card className="border-none dark:shadow-blue-900/5">
                <CardContent className="p-0 relative">
                    {/* Desktop Table View */}
                    <div className="hidden sm:block overflow-hidden rounded-xl border-1 z-10 border-solid border-y-theme-primary-100 border-x-theme-purple-200">
                        <Table>
                            <TableHeader className="border-b-1 border-b-solid border-b-neutral-400">
                                <TableRow className="bg-muted/50">
                                    <TableHead className={`${textTitle} w-[15%] px-4`}>{t('wallet.walletName')}</TableHead>
                                    <TableHead className={`${textTitle} w-[12%] px-4`}>{t('wallet.nickname')}</TableHead>
                                    <TableHead className={`${textTitle} w-[8%] px-4`}>{t('wallet.country')}</TableHead>
                                    <TableHead className={`${textTitle} w-[20%] px-4`}>{t('wallet.solanaAddress')}</TableHead>
                                    <TableHead className={`${textTitle} w-[20%] px-4`}>{t('wallet.ethAddress')}</TableHead>
                                    <TableHead className={`${textTitle} w-[8%] px-4`}>{t('wallet.type')}</TableHead>
                                    <TableHead className={`${textTitle} w-[8%] px-4`}>{t('wallet.walletLevel')}</TableHead>
                                    <TableHead className={`${textTitle} w-[9%] px-4`}>{t('common.actions')}</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {wallets?.map((wallet) => (
                                    <TableRow
                                        key={wallet.wallet_id}
                                        className="hover:bg-neutral-800/30 transition-colors"
                                    >
                                        <TableCell className={`px-4 ${textContent}`}>
                                            {renderEditableCell(wallet, 'name')}
                                        </TableCell>
                                        <TableCell className={`px-4 ${textContent}`}>
                                            {renderEditableCell(wallet, 'nickname')}
                                        </TableCell>
                                        <TableCell className={`px-4 ${textContent}`}>
                                            {renderEditableCell(wallet, 'country')}
                                        </TableCell>
                                        <TableCell className={`px-4 ${textContent}`}>
                                            <div className="flex items-center gap-2">
                                                <span className="truncate max-w-[180px]">
                                                    {truncateString(wallet.solana_address, 12)}
                                                </span>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-6 w-6 p-0 hover:bg-neutral-700/50 flex-shrink-0"
                                                    onClick={(e) => handleCopyAddress(wallet.solana_address, e)}
                                                >
                                                    {copiedAddress === wallet.solana_address ? (
                                                        <Check className="h-4 w-4 text-green-500" />
                                                    ) : (
                                                        <Copy className="h-4 w-4" />
                                                    )}
                                                </Button>
                                            </div>
                                        </TableCell>
                                        <TableCell className={`px-4 ${textContent}`}>
                                            <div className="flex items-center gap-2">
                                                <span className="truncate max-w-[180px]">
                                                    {truncateString(wallet.eth_address, 12)}
                                                </span>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-6 w-6 p-0 hover:bg-neutral-700/50 flex-shrink-0"
                                                    onClick={(e) => handleCopyAddress(wallet.eth_address, e)}
                                                >
                                                    {copiedAddress === wallet.eth_address ? (
                                                        <Check className="h-4 w-4 text-green-500" />
                                                    ) : (
                                                        <Copy className="h-4 w-4" />
                                                    )}
                                                </Button>
                                            </div>
                                        </TableCell>
                                        <TableCell className={`px-4 ${textContent}`}>
                                            <Badge
                                                className={`${wallet.wallet_type === "main"
                                                    ? "bg-green-50 dark:bg-green-900 border-green-600 text-green-300"
                                                    : wallet.wallet_type === "import"
                                                        ? " dark:bg-blue-900 border-blue-600 text-blue-300"
                                                        : "dark:bg-gray-700 border-gray-600 dark:text-theme-neutral-100 text-theme-neutral-900"
                                                    } px-2 py-1 whitespace-nowrap`}
                                            >
                                                {t(`listWalletss.walletType.${wallet.wallet_type}`)}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className={`px-4 ${textContent}`}>
                                            <Badge
                                                className={`${wallet.wallet_auth === "master"
                                                    ? "dark:bg-yellow-800 border-yellow-600 text-yellow-300"
                                                    : "dark:bg-gray-700 border-[#15DFFD] text-[#15DFFD]"
                                                    } px-2 py-1 whitespace-nowrap`}
                                            >
                                                {t(`listWalletss.walletType.${wallet.wallet_auth}`)}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className={`px-4 ${textContent}`}>
                                            <div className="flex items-center gap-1 cursor-pointer p-1 rounded-md">
                                                <div
                                                    className={`w-2.5 h-2.5 rounded-full ${walletInfor?.solana_address === wallet.solana_address
                                                        ? 'bg-theme-green-200 cursor-default'
                                                        : 'bg-neutral-200 hover:bg-theme-green-200 cursor-pointer'
                                                        }`}
                                                    onClick={() => walletInfor?.solana_address !== wallet.solana_address && handleChangeWallet(wallet)}
                                                />
                                                {wallet.wallet_type !== 'main' && walletInfor?.solana_address !== wallet.solana_address && (
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-6 w-6 p-0 hover:bg-red-700/50"
                                                        onClick={(e) => handleDeleteClick(wallet, e)}
                                                    >
                                                        <Trash2 className="h-4 w-4 text-red-500" />
                                                    </Button>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Mobile Card View */}
                    <div className="sm:hidden space-y-3 p-2">
                        {wallets?.map((wallet) => renderMobileWalletCard(wallet))}
                    </div>
                </CardContent>
            </Card>

            <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
                <DialogContent className="sm:max-w-[425px] p-0 border-none border-transparent">
                    <div className="bg-gradient-to-t from-theme-purple-100 to-theme-gradient-linear-end p-[1px] relative w-full rounded-xl">
                        <div className="w-full px-3 py-2 bg-theme-black-200 rounded-xl text-neutral-100">
                            <DialogHeader className="p-2">
                                <DialogTitle className="text-xl font-semibold text-indigo-500 backdrop-blur-sm boxShadow linear-200-bg mb-2 text-fill-transparent bg-clip-text">Xác nhận xóa ví</DialogTitle>
                                <DialogDescription className="text-neutral-100 text-sm">
                                    Bạn có chắc chắn muốn xóa ví {walletToDelete?.wallet_nick_name || walletToDelete?.wallet_name}?
                                    Hành động này không thể hoàn tác.
                                </DialogDescription>
                            </DialogHeader>
                            <DialogFooter className="flex justify-end gap-2 p-2">
                                <div className="bg-gradient-to-t from-theme-purple-100 to-theme-gradient-linear-end p-[1px] relative rounded-full">
                                    <button
                                        className="bg-theme-black-200 h-[30px] text-neutral-100 px-5 rounded-full"
                                        onClick={() => setDeleteModalOpen(false)}
                                    >
                                        Hủy
                                    </button>
                                </div>
                                <button
                                    className="linear-gradient-light dark:linear-gradient-connect hover:border h-[32px] border px-5 border-transparent rounded-full text-sm"
                                    onClick={() => handleDeleteWallet(walletToDelete?.wallet_id || '')}
                                >
                                    Xóa
                                </button>
                            </DialogFooter>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
} 