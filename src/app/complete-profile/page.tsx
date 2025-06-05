"use client"
import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form';
import { Input } from '@/ui/input';
import { Label } from '@/ui/label';
import { Button } from '@/ui/button';
import { Card, CardContent, CardHeader } from '@/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/ui/select';
import { langList } from '@/common';
import { useLang } from '@/lang';
import { ToastNotification } from '@/ui/toast';
import { useAuth } from '@/hooks/useAuth';
import { TelegramWalletService } from '@/services/api';
import { useRouter } from 'next/navigation';
import { getInforWallet } from '@/services/api/TelegramWalletService';
import { useQuery } from '@tanstack/react-query';

type FormData = {
    wallet_id: string;
    name: string;
    nick_name: string;
    country: string;
};

export default function CompleteProfile() {
    const { payloadToken } = useAuth();
    const { data: walletInfor, refetch } = useQuery({
        queryKey: ["wallet-infor"],
        queryFn: getInforWallet,
        refetchInterval: 30000,
        staleTime: 30000,  
    });
    const router = useRouter();
    const { t } = useLang();
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<FormData>({
        defaultValues: {
            wallet_id: (payloadToken as any)?.wallet_id || '',
            name: '',
            nick_name: '',
            country: langList[0].code
        },
        mode: 'onChange'
    });

    useEffect(() => {
        if (walletInfor?.wallet_nick_name) {
            router.push("/dashboard");
        }
    }, [walletInfor, router]);

    const onSubmit = async (formData: FormData) => {
        if (!formData.country) {
            setToastMessage(t("tglogin.countryRequired"));
            setShowToast(true);
            return;
        }
        try {
            const res = await TelegramWalletService.changeName(formData);
            refetch();
            router.push("/dashboard");
            setToastMessage(t("tglogin.submitSuccess"));
            setShowToast(true);
        } catch (error: any) {
            console.log(error);
            setToastMessage(t("tglogin.submitFailed"));
            setShowToast(true);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center">
            {showToast && (
                <ToastNotification 
                    message={toastMessage} 
                    onClose={() => setShowToast(false)}
                />
            )}
            <Card className="w-[25rem] p-4">
                <CardHeader>
                    <h2 className="text-2xl font-bold text-center">{t("tglogin.title")}</h2>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <input type="hidden" {...register("wallet_id")} />
                        
                        <div className="space-y-2">
                            <Label htmlFor="name">{t("tglogin.name")}</Label>
                            <Input
                                id="name"
                                {...register("name", {
                                    required: t("tglogin.nameRequired")
                                })}
                                placeholder={t("tglogin.namePlaceholder")}
                            />
                            {errors.name && (
                                <p className="text-sm text-red-500">
                                    {errors.name.message}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="nick_name">{t("tglogin.nickname")}</Label>
                            <Input
                                id="nick_name"
                                {...register("nick_name", {
                                    required: t("tglogin.nicknameRequired")
                                })}
                                placeholder={t("tglogin.nicknamePlaceholder")}
                            />
                            {errors.nick_name && (
                                <p className="text-sm text-red-500">
                                    {errors.nick_name.message}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="country">{t("tglogin.country")}</Label>
                            <Select
                                onValueChange={(value) => setValue("country", value)}
                                value={watch("country")}
                                required
                            >
                                <SelectTrigger id="country" className={errors.country ? "border-red-500" : ""}>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {langList.map((lang) => (
                                        <SelectItem key={lang.code} value={lang.code}>
                                            <div className="flex items-center gap-2">
                                                <img 
                                                    src={lang.flag} 
                                                    alt={lang.name} 
                                                    className="w-5 h-3 object-cover"
                                                />
                                                <span>{lang.name}</span>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.country && (
                                <p className="text-sm text-red-500">
                                    {t("tglogin.countryRequired")}
                                </p>
                            )}
                        </div>

                        <Button type="submit" className="w-full border">
                            {t("tglogin.submit")}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
