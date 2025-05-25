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
import { Copy, Edit, Check, X } from "lucide-react";
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
import { useWallet } from "@/services/api/TelegramWalletService";
import { useAuth } from "@/hooks/useAuth";

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

const textTitle = 'text-neutral-200 font-normal text-xs px-4 py-3'
const textContent = 'text-neutral-100 text-xs font-normal px-4 py-3'

export function WalletTable({ wallets, onCopyAddress, onUpdateWallet }: WalletTableProps) {
    const { toast } = useToast();
    const { t } = useTranslation();
    const { isAuthenticated, logout, updateToken } = useAuth();
    const [editingWalletId, setEditingWalletId] = useState<string | null>(null);
    const [editingField, setEditingField] = useState<'name' | 'nickname' | 'country' | null>(null);
    const [editingValue, setEditingValue] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleCopyAddress = (address: string, e: React.MouseEvent) => {
        e.stopPropagation();
        navigator.clipboard.writeText(address);
        onCopyAddress?.(address, e);
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

    const handleChangeWallet = async (wallet: Wallet) => {
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
        <Card className="border-none dark:shadow-blue-900/5">
            <CardContent className="p-0 relative">
                <div className="overflow-hidden rounded-xl border-1 z-10 border-solid border-y-[#15DFFD] border-x-[#720881]">
                    <Table>
                        <TableHeader className="border-b-1 border-b-solid border-b-neutral-400">
                            <TableRow className="bg-muted/50">
                                <TableHead className={`pl-4 ${textTitle}`}>Wallet Name</TableHead>
                                <TableHead className={textTitle}>Nickname</TableHead>
                                <TableHead className={textTitle}>Country</TableHead>
                                <TableHead className={textTitle}>Solana Address</TableHead>
                                <TableHead className={textTitle}>ETH Address</TableHead>
                                <TableHead className={textTitle}>Type</TableHead>
                                <TableHead className={textTitle}>Auth</TableHead>
                                <TableHead className={textTitle}>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {wallets?.map((wallet) => (
                                <TableRow
                                    key={wallet.wallet_id}
                                    className="hover:bg-neutral-800/30 transition-colors"
                                >
                                    <TableCell className={textContent}>
                                        {renderEditableCell(wallet, 'name')}
                                    </TableCell>
                                    <TableCell className={textContent}>
                                        {renderEditableCell(wallet, 'nickname')}
                                    </TableCell>
                                    <TableCell className={textContent}>
                                        {renderEditableCell(wallet, 'country')}
                                    </TableCell>
                                    <TableCell className={textContent}>
                                        <div className="flex items-center gap-3">
                                            <span className={`truncate max-w-[200px]`}>
                                                {truncateString(wallet.solana_address, 14)}
                                            </span>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-6 w-6 p-0 hover:bg-neutral-700/50"
                                                onClick={(e) => handleCopyAddress(wallet.solana_address, e)}
                                            >
                                                <Copy className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                    <TableCell className={textContent}>
                                        <div className="flex items-center gap-3">
                                            <span className={`truncate max-w-[200px]`}>
                                                {truncateString(wallet.eth_address, 14)}
                                            </span>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-6 w-6 p-0 hover:bg-neutral-700/50"
                                                onClick={(e) => handleCopyAddress(wallet.eth_address, e)}
                                            >
                                                <Copy className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                    <TableCell className={textContent}>
                                        <Badge
                                            className={`${wallet.wallet_type === "main"
                                                    ? "bg-green-900 border-green-600 text-green-300"
                                                    : wallet.wallet_type === "import"
                                                        ? "bg-blue-900 border-blue-600 text-blue-300"
                                                        : "bg-gray-700 border-gray-600 text-gray-300"
                                                } px-2 py-1`}
                                        >
                                            {wallet.wallet_type.charAt(0).toUpperCase() + wallet.wallet_type.slice(1)}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className={textContent}>
                                        <Badge
                                            className={`${wallet.wallet_auth === "master"
                                                    ? "bg-purple-900 border-purple-600 text-purple-300"
                                                    : "bg-gray-700 border-gray-600 text-gray-300"
                                                } px-2 py-1`}
                                        >
                                            {wallet.wallet_auth.charAt(0).toUpperCase() + wallet.wallet_auth.slice(1)}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className={textContent}>
                                        <div className="flex items-center space-x-2" onClick={() => handleChangeWallet(wallet)}>
                                            <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
} 