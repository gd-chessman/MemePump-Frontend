"use client"
import { useAuth } from '@/hooks/useAuth';
import { TelegramWalletService } from '@/services/api';
import { useRouter, useSearchParams } from 'next/navigation'
import React, { useEffect, Suspense, useState } from 'react'
import { toast } from 'react-toastify';
import { useForm } from 'react-hook-form';
import { Input } from '@/ui/input';
import { Label } from '@/ui/label';
import { Button } from '@/ui/button';
import { Card, CardContent, CardHeader } from '@/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/ui/select';
import { langList } from '@/common';
import { useLang } from '@/lang';

type FormData = {
    nickname: string;
    country: string;
};

function TelegramLoginContent() {
    const {isAuthenticated, login } = useAuth();
    const searchParams = useSearchParams();
    const router = useRouter();
    const [showForm, setShowForm] = useState(false);
    const { t } = useLang();
    const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<FormData>({
        defaultValues: {
            nickname: '',
            country: langList[0].code
        },
        mode: 'onChange'
    });

    const telegramId = searchParams.get("id");
    const code = searchParams.get("code");

    useEffect(() => {
        if (isAuthenticated) {
            window.location.href = '/dashboard';
        }else if (telegramId && code){
            handleLogin();
        }
    }, []);

    const handleLogin = async() =>{
        try {
            const data = {id: telegramId, code : code}
            const res = await TelegramWalletService.login(data);
            if(res.status == 401){
                toast.warn("Invalid authentication !")
            }
            if(res.status == 403){
                // setShowForm(true);
            }
            if(res.status == 200){
                login(res.token);
                window.location.href = '/dashboard';
            }

        } catch (error: any) {
            console.log(error)
        }
    }

    const onSubmit = async (formData: FormData) => {
        if (!formData.country) {
            toast.error(t("tglogin.countryRequired"));
            return;
        }
        try {
            const data = {
                id: telegramId,
                code: code,
                nickname: formData.nickname,
                country: formData.country
            };
            const res = await TelegramWalletService.login(data);
            if(res.status === 200) {
                login(res.token);
                window.location.href = '/dashboard';
            }
        } catch (error: any) {
            console.log(error);
            toast.error(t("tglogin.submitFailed"));
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center">
            {showForm ? (
                <Card className="w-[25rem]">
                    <CardHeader>
                        <h2 className="text-2xl font-bold text-center">{t("tglogin.title")}</h2>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="nickname">{t("tglogin.nickname")}</Label>
                                <Input
                                    id="nickname"
                                    {...register("nickname", {
                                        required: t("tglogin.nicknameRequired")
                                    })}
                                    placeholder={t("tglogin.nicknamePlaceholder")}
                                />
                                {errors.nickname && (
                                    <p className="text-sm text-red-500">
                                        {errors.nickname.message}
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
            ) : (
                <div></div>
            )}
        </div>
    )
}

export default function TelegramLogin() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <TelegramLoginContent />
        </Suspense>
    )
}
