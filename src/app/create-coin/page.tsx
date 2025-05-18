"use client"

import { useState, useRef, type ChangeEvent, type FormEvent, useEffect } from "react"
import { Upload, X, Undo2 } from "lucide-react"
import Image from "next/image"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select"
import ethereum from "@/assets/svgs/ethereum-icon.svg"
import user from "@/assets/svgs/user-icon.svg"
import arrow from "@/assets/svgs/arrow-icon.svg"
import noCoin from "@/assets/svgs/no-token.svg"
import Link from "next/link"

type CoinFormData = {
    name: string
    symbol: string
    amount: string
    category: string
    description: string
    telegram: string
    website: string
    twitter: string
    logo: File | null
    logoPreview: string | null
}

type FormErrors = {
    [key in keyof Omit<CoinFormData, "logoPreview">]?: string
}

const CATEGORIES = ["Meme", "DeFi", "NFT", "GameFi", "AI", "Layer 1", "Layer 2"]

const globalStyles = `
    select option {
        background-color: #000;
        color: white;
    }
    select:focus {
        border-color: rgb(59 130 246 / 0.5);
        box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
    }
    select::-webkit-scrollbar {
        width: 8px;
    }
    select::-webkit-scrollbar-track {
        background: rgba(0, 0, 0, 0.3);
        border-radius: 4px;
    }
    select::-webkit-scrollbar-thumb {
        background: rgba(59, 130, 246, 0.5);
        border-radius: 4px;
    }
    select::-webkit-scrollbar-thumb:hover {
        background: rgba(59, 130, 246, 0.7);
    }
`

export default function CreateCoinForm() {
    const [formData, setFormData] = useState<CoinFormData>({
        name: "",
        symbol: "",
        amount: "",
        category: "",
        description: "",
        telegram: "",
        website: "",
        twitter: "",
        logo: null,
        logoPreview: null,
    })

    const [errors, setErrors] = useState<FormErrors>({})
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [showCategoryDropdown, setShowCategoryDropdown] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [activeTab, setActiveTab] = useState("today")

    useEffect(() => {
        const style = document.createElement('style')
        style.textContent = globalStyles
        document.head.appendChild(style)
        return () => {
            document.head.removeChild(style)
        }
    }, [])

    const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData((prev) => ({ ...prev, [name]: value }))

        // Clear error when user types
        if (errors[name as keyof FormErrors]) {
            setErrors((prev) => ({ ...prev, [name]: undefined }))
        }
    }

    const handleAmountChange = (e: ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/[^0-9.]/g, "")
        setFormData((prev) => ({ ...prev, amount: value }))

        if (errors.amount) {
            setErrors((prev) => ({ ...prev, amount: undefined }))
        }
    }

    const handleCategorySelect = (category: string) => {
        setFormData((prev) => ({ ...prev, category }))
        setShowCategoryDropdown(false)

        if (errors.category) {
            setErrors((prev) => ({ ...prev, category: undefined }))
        }
    }

    const handleLogoUpload = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        // Check file type
        if (!file.type.startsWith("image/")) {
            setErrors((prev) => ({ ...prev, logo: "Please upload an image file" }))
            return
        }

        // Check file size (max 2MB)
        if (file.size > 2 * 1024 * 1024) {
            setErrors((prev) => ({ ...prev, logo: "Image size should be less than 2MB" }))
            return
        }

        const reader = new FileReader()
        reader.onload = () => {
            setFormData((prev) => ({
                ...prev,
                logo: file,
                logoPreview: reader.result as string,
            }))
        }
        reader.readAsDataURL(file)

        if (errors.logo) {
            setErrors((prev) => ({ ...prev, logo: undefined }))
        }
    }

    const handleRemoveLogo = () => {
        setFormData((prev) => ({
            ...prev,
            logo: null,
            logoPreview: null,
        }))
        if (fileInputRef.current) {
            fileInputRef.current.value = ""
        }
    }

    const validateForm = (): boolean => {
        const newErrors: FormErrors = {}

        if (!formData.name.trim()) {
            newErrors.name = "Coin name is required"
        }

        if (!formData.symbol.trim()) {
            newErrors.symbol = "Coin symbol is required"
        } else if (formData.symbol.length > 10) {
            newErrors.symbol = "Symbol should be 10 characters or less"
        }

        if (!formData.amount.trim()) {
            newErrors.amount = "Initial liquidity amount is required"
        } else if (isNaN(Number(formData.amount)) || Number(formData.amount) <= 0) {
            newErrors.amount = "Please enter a valid amount"
        }

        if (!formData.category) {
            newErrors.category = "Please select a category"
        }

        if (!formData.logo) {
            newErrors.logo = "Coin logo is required"
        }

        // Optional fields validation
        if (formData.website && !formData.website.startsWith("http")) {
            newErrors.website = "Please enter a valid URL starting with http:// or https://"
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault()

        if (!validateForm()) {
            return
        }

        setIsSubmitting(true)

        try {
            // Here you would normally send the data to your API
            // For demonstration, we'll just simulate a delay
            await new Promise((resolve) => setTimeout(resolve, 1500))

            // Success handling
            alert("Coin created successfully!")

            // Reset form
            setFormData({
                name: "",
                symbol: "",
                amount: "",
                category: "",
                description: "",
                telegram: "",
                website: "",
                twitter: "",
                logo: null,
                logoPreview: null,
            })
        } catch (error) {
            console.error("Error creating coin:", error)
            alert("Failed to create coin. Please try again.")
        } finally {
            setIsSubmitting(false)
        }
    }

    const classInput = "w-full h-10 px-4 bg-transparent bg-opacity-60 border rounded-xl p-3 text-neutral-200 focus:outline-none placeholder:text-sm placeholder:text-neutral-200 placeholder:font-normal " + (errors.name ? "border-red-500" : "border-t-theme-primary-300 border-l-theme-primary-300 border-b-theme-gradient-linear-start border-r-theme-gradient-linear-start")
    const classLabel = "block text-sm font-normal text-neutral-100 mb-1"

    const ethereumIcon = (width: number, height: number) => {
        return <img src={"/ethereum.png"} alt="ethereum-icon" width={width} height={height} />
    }
    return (
        <div className="container-body px-[40px] flex gap-6 py-[30px] relative mx-auto z-10">
            {/* Main Form */}
            <div className="border-create-coin w-2/3 bg-transparent bg-opacity-30 rounded-xl p-[30px] shadow-lg mt-[20px] flex flex-col">
                <div className="w-full h-full flex flex-col">
                    <h2 className="text-center text-2xl font-bold text-neutral-100 mb-8 flex items-center justify-center gap-2">
                        {ethereumIcon(20, 20)}
                        CREATE NEW COIN
                        {ethereumIcon(20, 20)}
                    </h2>

                    <form onSubmit={handleSubmit} className="flex-1 flex flex-col justify-between min-h-0">
                        <div className="flex flex-col gap-5 ">
                            <div className="flex justify-between gap-6">
                                {/* Name */}
                                <div className="w-1/2">
                                    <label htmlFor="name" className={classLabel}>
                                        Name <span className="text-theme-red-200">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        placeholder="Enter coin name"
                                        className={classInput}
                                    />
                                    {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
                                </div>

                                {/* Symbol */}
                                <div className="w-1/2">
                                    <label htmlFor="symbol" className={classLabel}>
                                        Symbol <span className="text-theme-red-200">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        id="symbol"
                                        name="symbol"
                                        value={formData.symbol}
                                        onChange={handleInputChange}
                                        placeholder="Enter coin symbol"
                                        className={classInput}
                                    />
                                    {errors.symbol && <p className="mt-1 text-xs text-red-500">{errors.symbol}</p>}
                                </div>
                            </div>
                            <div className="flex justify-between gap-6">
                                {/* Amount */}
                                <div className="w-1/2">
                                    <label htmlFor="amount" className={classLabel}>
                                        Amount <span className="text-theme-red-200">*</span>
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            id="amount"
                                            name="amount"
                                            value={formData.amount}
                                            onChange={handleAmountChange}
                                            placeholder="Enter initial liquidity amount in SOL"
                                            className={classInput}
                                        />
                                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                            <span className="text-neutral-200 text-sm">(SOL)</span>
                                        </div>
                                        {formData.amount && (
                                            <button
                                                type="button"
                                                onClick={() => setFormData((prev) => ({ ...prev, amount: "" }))}
                                                className="absolute inset-y-0 right-16 flex items-center pr-3 text-neutral-200 hover:text-gray-200"
                                            >
                                                <X className="h-4 w-4" />
                                            </button>
                                        )}
                                    </div>
                                    {errors.amount && <p className="mt-1 text-xs text-red-500">{errors.amount}</p>}
                                </div>

                                {/* Categories */}
                                <div className="w-1/2">
                                    <label htmlFor="category" className={classLabel}>
                                        Categories <span className="text-theme-red-200">*</span>
                                    </label>
                                    <div className="relative">
                                        <Select>
                                            <SelectTrigger className={classInput}>
                                                <SelectValue className="mb-0" placeholder="Categories..." />
                                            </SelectTrigger>
                                            <SelectContent className={"bg-white dark:bg-neutral-900 box-shadow-info rounded-xl z-10 "}>
                                                {CATEGORIES.map((category) => (
                                                    <SelectItem className="text-gray-700 dark:text-neutral-400 cursor-pointer hover:bg-gray-100 dark:hover:bg-transparent" value={category}>{category}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    {errors.category && <p className="mt-1 text-xs text-red-500">{errors.category}</p>}
                                </div>
                            </div>

                            {/* Description */}
                            <div>
                                <label htmlFor="description" className={classLabel}>
                                    Description
                                </label>
                                <textarea
                                    id="description"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    placeholder="Enter coin description"
                                    rows={4}
                                    cols={5}
                                    className={classInput}
                                />
                                {errors.description && <p className="mt-1 text-xs text-red-500">{errors.description}</p>}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Telegram */}
                                <div>
                                    <label htmlFor="telegram" className={classLabel}>
                                        Telegram
                                    </label>
                                    <input
                                        type="text"
                                        id="telegram"
                                        name="telegram"
                                        value={formData.telegram}
                                        onChange={handleInputChange}
                                        placeholder="Enter telegram group link"
                                        className={classInput}
                                    />
                                </div>

                                {/* Twitter */}
                                <div>
                                    <label htmlFor="twitter" className={classLabel}>
                                        Twitter
                                    </label>
                                    <input
                                        type="text"
                                        id="twitter"
                                        name="twitter"
                                        value={formData.twitter}
                                        onChange={handleInputChange}
                                        placeholder="Enter twitter username"
                                        className={classInput}
                                    />
                                </div>

                                {/* Website */}
                                <div>
                                    <label htmlFor="website" className={classLabel}>
                                        Website
                                    </label>
                                    <input
                                        type="text"
                                        id="website"
                                        name="website"
                                        value={formData.website}
                                        onChange={handleInputChange}
                                        placeholder="Enter coin website"
                                        className={classInput}
                                    />
                                    {errors.website && <p className="mt-1 text-xs text-red-500">{errors.website}</p>}
                                </div>
                            </div>
                            <div className="flex gap-4 w-full">
                                <div className="w-1/2">
                                    <label className={classLabel}>
                                        Logo <span className="text-theme-red-200">*</span>
                                    </label>
                                    <div
                                        className={`border-2 border-dashed ${errors.logo ? "border-red-500" : "border-blue-500/50"
                                            } rounded-lg p-4 h-full flex items-center justify-center cursor-pointer relative overflow-hidden`}
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleLogoUpload} />

                                        {formData.logoPreview ? (
                                            <div className="relative w-full h-full flex items-center justify-center">
                                                <img
                                                    src={formData.logoPreview || "/placeholder.svg"}
                                                    alt="Logo preview"
                                                    width={200}
                                                    fill
                                                    className="object-contain"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        handleRemoveLogo()
                                                    }}
                                                    className="absolute top-0 right-0 bg-red-500 rounded-full p-1 m-1"
                                                >
                                                    <X className="h-4 w-4 text-neutral-100" />
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="text-center">
                                                <Upload className="h-8 w-8 text-neutral-100 mx-auto mb-2" />
                                                <p className="text-xs text-neutral-100 font-normal">Click to upload</p>
                                            </div>
                                        )}
                                    </div>
                                    {errors.logo && <p className="mt-1 text-xs text-red-500">{errors.logo}</p>}
                                </div>
                                {/* Preview */}
                                <div className="w-1/2">
                                    <label className={classLabel}>Preview</label>
                                    <div className="bg-black bg-opacity-60 border border-blue-500/50 rounded-lg p-6 relative h-full">
                                        <div className="flex flex-col items-center gap-3 h-full mt-4">
                                            <div className="w-16 h-16 bg-white rounded-full overflow-hidden mb-2 flex items-center justify-center">
                                                {formData.logoPreview ? (
                                                    <img
                                                        src={formData.logoPreview || "/placeholder.svg"}
                                                        alt="Logo preview"
                                                        width={64}
                                                        height={64}
                                                        className="object-cover"
                                                    />
                                                ) : (
                                                    <img src={"/user-icon.png"} alt="user-icon" width={64} height={64} />
                                                )}
                                            </div>
                                            <h3 className="text-neutral-100 font-semibold text-sm">{formData.name || "YOUR COIN NAME"}</h3>
                                            <p className="text-neutral-100 text-xs font-normal my-2 ">{formData.symbol || "SYMBOL"}</p>
                                            <p className="text-neutral-100 text-xs font-normal text-center ">
                                                {formData.description || "Your coin description will appear here"}
                                            </p>
                                        </div>
                                        <button type="button" className="absolute top-2 right-2 text-neutral-100 hover:text-theme-primary-300 flex items-center gap-2">
                                            <Undo2 className="h-4 w-4" /> Undo
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Submit Button - Fixed at bottom */}
                        <div className="mt-8 pt-4">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full max-w-[400px] create-coin-bg hover:linear-200-bg hover-bg-delay dark:text-neutral-100 font-medium px-6 py-[6px] rounded-full transition-all duration-500 ease-in-out disabled:opacity-70 disabled:cursor-not-allowed mx-auto block"
                            >
                                {isSubmitting ? "CREATING..." : "CREATE COIN"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Sidebar */}
            <div className="w-1/3 space-y-6 mt-[20px] flex flex-col gap-2">
                {/* My Coins */}
                <div className="rounded-xl border p-8 shadow-lg border-my-coin flex-1 flex flex-col justify-between">
                    <div>
                        <h2 className="text-center text-lg font-bold text-neutral-100 mb-4 flex items-center justify-center gap-2">
                            {ethereumIcon(20, 20)}
                            MY COINS
                            {ethereumIcon(20, 20)}
                        </h2>

                        <div className="flex justify-evenly mb-6">
                            <button onClick={() => setActiveTab("today")} className={`text-sm ${activeTab === "today" ? "text-theme-gradient-linear-start" : "text-gray-400"}`}>Today</button>
                            <button onClick={() => setActiveTab("last8days")} className={`text-gray-400 text-sm hover:text-gray-300 ${activeTab === "last8days" ? "text-theme-gradient-linear-start" : "text-gray-400"}`}>Last 8 days</button>
                            <button onClick={() => setActiveTab("lastmonth")} className={`text-gray-400 text-sm hover:text-gray-300 ${activeTab === "lastmonth" ? "text-theme-gradient-linear-start" : "text-gray-400"}`}>Last month</button>
                        </div>

                        <div className="flex flex-col items-center justify-center py-8">
                            <img src={"/no-list-token.png"} alt="no-coin-icon" width={180} height={180} />
                            <p className="text-neutral-100 mt-3 font-medium">No coins created recently</p>
                        </div>
                    </div>

                    <div className="mt-6 text-center">
                        <button className="text-neutral-100 flex gap-2 items-center justify-center mx-auto hover:text-blue-400 transition-colors">
                            <Link href="/my-coin" className="text-neutral-100 font-medium text-sm">SEE ALL MY COINS</Link>
                            <img src={"/arrow.png"} alt="arrow-icon" width={15} height={14} />
                        </button>
                    </div>
                </div>

                {/* Guide */}
                <div className="bg-gradient-guide rounded-xl border p-6 shadow-lg border-my-coin">
                    <h2 className="text-center text-lg font-bold text-neutral-100 mb-6 flex items-center justify-center gap-2">
                        {ethereumIcon(20, 20)}
                        GUIDE
                        {ethereumIcon(20, 20)}
                    </h2>

                    <ul className="space-y-4">
                        <li className="text-neutral-100 font-medium text-sm flex justify-center">Cannot be deleted or edited after creation</li>
                        <li className="text-neutral-100 font-medium text-sm flex justify-center">Deployed on Solana</li>
                        <li className="text-neutral-100 font-medium text-sm flex justify-center">Tradable if eligible</li>
                        <li className="text-neutral-100 font-medium text-sm flex justify-center">
                            Each coin has a unique wallet and token - store securely
                        </li>
                    </ul>
                </div>

            </div>
        </div>
    )
}
