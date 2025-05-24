"use client";

import {
  useState,
  useRef,
  type ChangeEvent,
  type FormEvent,
  useEffect,
} from "react";
import { Upload, X, Undo2, Copy } from "lucide-react";
import Image from "next/image";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/ui/select";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { getTokenCategorys, createToken, getMyTokens } from "@/services/api/TelegramWalletService";
import React from "react";
import { useRouter } from "next/navigation";
import notify from "@/app/components/notify";
import { NotifyProvider } from "@/app/components/notify";
import { useLang } from "@/lang/useLang";
import { truncateString } from "@/utils/format";

type CoinFormData = {
  name: string;
  symbol: string;
  amount: string;
  description: string;
  image: File | null;
  telegram?: string;
  website?: string;
  twitter?: string;
  showName: boolean;
  category: string;
  logo: File | null;
  logoPreview: string | null;
  category_list: string[];
};

type FormErrors = {
  [key in keyof Omit<CoinFormData, "logoPreview">]?: string;
};

type TokenData = {
  address: string;
  created_at: string;
  decimals: number;
  description: string;
  initial_liquidity: string;
  is_verified: boolean;
  logo_url: string;
  metadata_uri: string;
  name: string;
  symbol: string;
  telegram: string;
  token_id: number;
  transaction_hash: string;
  twitter: string;
  updated_at: string;
  website: string;
};

const coins = [
  {
    name: "Axie Infinity",
    image: "/token.png",
    symbol: "AXS",
    address: "9BB6NF....bgpump",
  },
  {
    name: "Axie Infinity",
    image: "/token.png",
    symbol: "AXS",
    address: "9BB6NF....bgpump",
  },
  {
    name: "Axie Infinity",
    image: "/token.png",
    symbol: "AXS",
    address: "9BB6NF....bgpump",
  },
  {
    name: "Axie Infinity",
    image: "/token.png",
    symbol: "AXS",
    address: "9BB6NF....bgpump",
  },
  {
    name: "Axie Infinity",
    image: "/token.png",
    symbol: "AXS",
    address: "9BB6NF....bgpump",
  },
  {
    name: "Axie Infinity",
    image: "/token.png",
    symbol: "AXS",
    address: "9BB6NF....bgpump",
  },
];

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
`;

export default function CreateCoinForm() {
  const router = useRouter();
  const { t, tArray } = useLang();
  const [formData, setFormData] = useState<CoinFormData>({
    name: "",
    symbol: "",
    amount: "0",
    category: "",
    description: "",
    telegram: "",
    website: "",
    twitter: "",
    logo: null,
    logoPreview: null,
    category_list: [],
    image: null,
    showName: false,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showOtherOption, setShowOtherOption] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState("today");
  const { data: categories = [] } = useQuery({
    queryKey: ["token-categories"],
    queryFn: getTokenCategorys,
  });

  const [searchQuery, setSearchQuery] = useState("");

  // Filter categories based on search query
  const filteredCategories = React.useMemo(() => {
    if (!searchQuery.trim()) return categories;
    return categories.filter((category: any) =>
      category.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [categories, searchQuery]);

  console.log("categories", categories)
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = globalStyles;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error when user types
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleAmountChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9.]/g, "");
    // Remove leading zeros except for decimal numbers (0.xxx)
    const processedValue = value.replace(/^0+(\d)/, '$1').replace(/^0+$/, '0');

    setFormData((prev) => ({ ...prev, amount: processedValue }));

    if (errors.amount) {
      setErrors((prev) => ({ ...prev, amount: undefined }));
    }
  };

  const { data: memeCoins = [] } = useQuery({
    queryKey: ["my-tokens"],
    queryFn: getMyTokens,
  });

  // Filter memeCoins based on activeTab
  const filteredMemeCoins = React.useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const eightDaysAgo = new Date(today);
    eightDaysAgo.setDate(today.getDate() - 8);
    const lastMonth = new Date(today);
    lastMonth.setMonth(today.getMonth() - 1);

    return memeCoins.filter((coin: TokenData) => {
      const coinDate = new Date(coin.created_at);
      switch (activeTab) {
        case "today":
          return coinDate >= today;
        case "last8days":
          return coinDate >= eightDaysAgo && coinDate < today;
        case "lastmonth":
          return coinDate ;
        default:
          return true;
      }
    });
  }, [memeCoins, activeTab]);

  const handleCategorySelect = (categoryId: string) => {
    setFormData((prev) => {
      const newCategoryList = prev.category_list.includes(categoryId)
        ? prev.category_list.filter(id => id !== categoryId)
        : [...prev.category_list, categoryId];

      return {
        ...prev,
        category_list: newCategoryList
      };
    });

    if (errors.category_list) {
      setErrors((prev) => ({ ...prev, category_list: undefined }));
    }
  };

  const handleLogoUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file type
    if (!file.type.startsWith("image/")) {
      setErrors((prev) => ({ ...prev, logo: "Please upload an image file" }));
      return;
    }

    // Check file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setErrors((prev) => ({
        ...prev,
        logo: "Image size should be less than 2MB",
      }));
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setFormData((prev) => ({
        ...prev,
        logo: file,
        logoPreview: reader.result as string,
      }));
    };
    reader.readAsDataURL(file);

    if (errors.logo) {
      setErrors((prev) => ({ ...prev, logo: undefined }));
    }
  };

  const handleRemoveLogo = () => {
    setFormData((prev) => ({
      ...prev,
      logo: null,
      logoPreview: null,
    }));
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Coin name is required";
    }

    if (!formData.symbol.trim()) {
      newErrors.symbol = "Coin symbol is required";
    } else if (formData.symbol.length > 10) {
      newErrors.symbol = "Symbol should be 10 characters or less";
    }

    if (!formData.amount.trim()) {
      newErrors.amount = "Initial liquidity amount is required";
    } else if (isNaN(Number(formData.amount)) || Number(formData.amount) < 0) {
      newErrors.amount = "Please enter a valid amount";
    }

    if (!formData.logo) {
      newErrors.logo = "Coin logo is required";
    }

    // Optional fields validation
    if (formData.website && !formData.website.startsWith("http")) {
      newErrors.website =
        "Please enter a valid URL starting with http:// or https://";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Create FormData object to handle file upload
      const formDataToSend = new FormData();

      // Add all form fields to FormData
      formDataToSend.append("name", formData.name);
      formDataToSend.append("symbol", formData.symbol);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("amount", String(formData.amount || 0));
      formDataToSend.append("category_list", formData.category_list.join(","));

      // Add optional fields if they exist
      if (formData.telegram) formDataToSend.append("telegram", formData.telegram);
      if (formData.website) formDataToSend.append("website", formData.website);
      if (formData.twitter) formDataToSend.append("twitter", formData.twitter);

      // Add logo file if it exists
      if (formData.logo) {
        formDataToSend.append("image", formData.logo);
      }

      // Send data to API
      const response = await createToken(formDataToSend);

      // Handle success
      if (response) {
        // Show success notification
        notify({
          message: "Coin created successfully!",
          type: "success"
        });

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
          category_list: [],
          image: null,
          showName: false,
        });

        // Redirect to my coins page after a short delay
        setTimeout(() => {
          router.push("/my-coin");
        }, 1500);
      }
    } catch (error: any) {
      console.error("Error creating coin:", error);
      // Show error notification
      notify({
        message: error.response?.data?.error || "Failed to create coin. Please try again.",
        type: "error"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const classInput =
    "w-full h-10 px-4 bg-transparent bg-opacity-60 border rounded-xl p-3 text-neutral-200 focus:outline-none placeholder:text-sm placeholder:text-neutral-200 placeholder:font-normal " +
    (errors.name
      ? "border-red-500"
      : "border-t-theme-primary-300 border-l-theme-primary-300 border-b-theme-gradient-linear-start border-r-theme-gradient-linear-start");
  const classLabel = "block text-sm font-normal text-neutral-100 mb-1";

  const ethereumIcon = (width: number, height: number) => {
    return (
      <img src={"/ethereum.png"} alt="ethereum-icon" width={width} height={height} />
    );
  };
  return (
    <>
      <NotifyProvider />
      <div className="container-body px-[40px] flex gap-6 py-[30px] relative mx-auto z-10">
        {/* Main Form */}
        <div className="border-create-coin w-2/3 bg-transparent flex-1 bg-opacity-30 rounded-xl p-[30px] shadow-lg flex flex-col ">
          <div className="w-full h-full flex flex-col">
            <h2 className="text-center text-2xl font-bold text-neutral-100 mb-6 flex items-center justify-center gap-2">
              {ethereumIcon(20, 20)}
              {t('createCoin.title')}
              {ethereumIcon(20, 20)}
            </h2>

            <form
              onSubmit={handleSubmit}
              className="flex-1 flex flex-col justify-between min-h-0"
            >
              <div className="flex flex-col gap-5 ">
                <div className="flex justify-between gap-6">
                  {/* Name */}
                  <div className="w-1/2">
                    <label htmlFor="name" className={classLabel}>
                      {t('createCoin.form.name.label')} <span className="text-theme-red-200">*</span>
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder={t('createCoin.form.name.placeholder')}
                      className={classInput}
                    />
                    {errors.name && (
                      <p className="mt-1 text-xs text-red-500">{t('createCoin.form.name.required')}</p>
                    )}
                  </div>

                  {/* Symbol */}
                  <div className="w-1/2">
                    <label htmlFor="symbol" className={classLabel}>
                      {t('createCoin.form.symbol.label')} <span className="text-theme-red-200">*</span>
                    </label>
                    <input
                      type="text"
                      id="symbol"
                      name="symbol"
                      value={formData.symbol}
                      onChange={handleInputChange}
                      placeholder={t('createCoin.form.symbol.placeholder')}
                      className={classInput}
                    />
                    {errors.symbol && (
                      <p className="mt-1 text-xs text-red-500">
                        {errors.symbol === "Symbol should be 10 characters or less"
                          ? t('createCoin.form.symbol.maxLength')
                          : t('createCoin.form.symbol.required')}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex justify-between gap-6">
                  {/* Amount */}
                  <div className="w-1/2">
                    <label htmlFor="amount" className={classLabel}>
                      {t('createCoin.form.amount.label')} <span className="text-theme-red-200">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        id="amount"
                        name="amount"
                        value={formData.amount || 0}
                        onChange={handleAmountChange}
                        placeholder={t('createCoin.form.amount.placeholder')}
                        className={classInput}
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <span className="text-neutral-200 text-sm">(SOL)</span>
                      </div>
                      {formData.amount && (
                        <button
                          type="button"
                          onClick={() =>
                            setFormData((prev) => ({ ...prev, amount: "" }))
                          }
                          className="absolute inset-y-0 right-16 flex items-center pr-3 text-neutral-200 hover:text-gray-200"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                    {errors.amount && (
                      <p className="mt-1 text-xs text-red-500">
                        {errors.amount === "Please enter a valid amount"
                          ? t('createCoin.form.amount.invalid')
                          : t('createCoin.form.amount.required')}
                      </p>
                    )}
                  </div>

                  {/* Categories */}
                  <div className="w-1/2">
                    <label htmlFor="category" className={classLabel}>
                      {t('createCoin.form.categories.label')}
                    </label>
                    <div className="relative">
                      <Select
                        onValueChange={handleCategorySelect}
                        value={formData.category_list[formData.category_list.length - 1] || ""}
                      >
                        <SelectTrigger className={classInput}>
                          <SelectValue placeholder={t('createCoin.form.categories.placeholder')}>
                            {formData.category_list.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {formData.category_list.map((categoryId) => {
                                  const category = categories.find((c: any) => c.id === categoryId);
                                  return category ? (
                                    <span key={categoryId} className="text-sm">
                                      {category.name}
                                      {formData.category_list.indexOf(categoryId) !== formData.category_list.length - 1 ? ", " : ""}
                                    </span>
                                  ) : null;
                                })}
                              </div>
                            )}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent
                          className="bg-white dark:bg-neutral-900 box-shadow-info rounded-xl z-10"
                        >
                          <div className="sticky top-0 p-2 bg-white dark:bg-neutral-900 border-b border-neutral-700">
                            <input
                              type="text"
                              placeholder={t('createCoin.form.categories.search')}
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                              className="w-full h-10 px-4 bg-transparent bg-opacity-60 border rounded-xl p-3 text-neutral-200 focus:outline-none placeholder:text-sm placeholder:text-neutral-200 placeholder:font-normal"
                            />
                          </div>
                          <div className="max-h-[200px] overflow-y-auto">
                            {filteredCategories.length === 0 ? (
                              <div className="p-2 text-center text-neutral-400 text-sm">
                                {t('createCoin.form.categories.noResults')}
                              </div>
                            ) : (
                              filteredCategories.map((category: any) => (
                                <SelectItem
                                  key={category.id}
                                  className={`text-gray-700 dark:text-neutral-400 cursor-pointer hover:bg-gray-100 dark:hover:bg-neutral-800 dark:hover:text-theme-neutral-100 ${formData.category_list.includes(category.id) ? 'bg-blue-100 dark:bg-blue-900' : ''
                                    }`}
                                  value={category.id}
                                >
                                  <div className="flex items-center gap-2">
                                    {formData.category_list.includes(category.id) && (
                                      <span className="text-blue-500">✓</span>
                                    )}
                                    {category.name}
                                  </div>
                                </SelectItem>
                              ))
                            )}
                          </div>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label htmlFor="description" className={classLabel}>
                    {t('createCoin.form.description.label')}
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder={t('createCoin.form.description.placeholder')}
                    rows={4}
                    cols={5}
                    className={classInput}
                  />
                  {errors.description && (
                    <p className="mt-1 text-xs text-theme-red-100">
                      {errors.description}
                    </p>
                  )}
                </div>

                <div className="flex gap-4 w-full">
                  <div className="w-1/2">
                    <label className={classLabel}>
                      {t('createCoin.form.logo.label')} <span className="text-theme-red-200">*</span>
                    </label>
                    <div
                      className={`border-2 border-dashed ${errors.logo ? "border-red-500" : "border-blue-500/50"
                        } rounded-lg p-4 h-full flex items-center justify-center cursor-pointer relative overflow-hidden`}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/*"
                        onChange={handleLogoUpload}
                      />

                      {formData.logoPreview ? (
                        <div className="relative w-full h-full flex items-center justify-center">
                          <img
                            src={formData.logoPreview || "/placeholder.svg"}
                            alt="Logo preview"
                            width={150}
                            className="object-contain"
                          />
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveLogo();
                            }}
                            className="absolute top-0 right-0 bg-red-500 rounded-full p-1 m-1"
                          >
                            <X className="h-4 w-4 text-neutral-100" />
                          </button>
                        </div>
                      ) : (
                        <div className="text-center">
                          <Upload className="h-8 w-8 text-neutral-100 mx-auto mb-2" />
                          <p className="text-xs text-neutral-100 font-normal">
                            {t('createCoin.form.logo.upload')}
                          </p>
                        </div>
                      )}
                    </div>
                    {errors.logo && (
                      <p className="mt-1 text-xs text-red-500">
                        {errors.logo === "Please upload an image file"
                          ? t('createCoin.form.logo.invalidType')
                          : errors.logo === "Image size should be less than 2MB"
                            ? t('createCoin.form.logo.maxSize')
                            : t('createCoin.form.logo.required')}
                      </p>
                    )}
                  </div>
                  {/* Preview */}
                  <div className="w-1/2">
                    <label className={classLabel}>{t('createCoin.form.preview.label')}</label>
                    <div className="bg-black bg-opacity-60 border border-blue-500/50 rounded-lg p-6 relative h-full flex flex-col justify-center items-center">
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-16 h-16 bg-white rounded-full overflow-hidden mb-2 flex items-center justify-center">
                          {formData.logoPreview ? (
                            <img
                              src={formData.logoPreview}
                              alt="Logo preview"
                              width={64}
                              height={64}
                              className="object-cover"
                            />
                          ) : (
                            <img
                              src={"/user-icon.png"}
                              alt="user-icon"
                              width={40}
                              height={40}
                            />
                          )}
                        </div>
                        <h3 className="text-neutral-100 font-semibold text-sm">
                          {formData.name || t('createCoin.form.preview.name')}
                        </h3>
                        <p className="text-neutral-100 text-xs font-normal my-2 ">
                          {formData.symbol || t('createCoin.form.preview.symbol')}
                        </p>
                        <p className="text-neutral-100 text-xs font-normal text-center ">
                          {formData.description || t('createCoin.form.preview.description')}
                        </p>
                      </div>
                      <button
                        type="button"
                        className="absolute top-2 right-2 text-neutral-100 hover:text-theme-primary-300 flex items-center gap-2"
                      >
                        <Undo2 className="h-4 w-4" /> {t('createCoin.form.preview.undo')}
                      </button>
                    </div>
                  </div>
                </div>
                <div
                  style={{ marginBottom: "-10px" }}
                  className={`mt-6 cursor-pointer hover:text-theme-primary-300 ${showOtherOption && "text-theme-primary-300"
                    }`}
                  onClick={() => setShowOtherOption(!showOtherOption)}
                >
                  {t('createCoin.form.otherOptions.title')}
                </div>
                {showOtherOption && (
                  <div className="flex justify-between gap-6">
                    {/* Telegram */}
                    <div className="flex-1">
                      <label htmlFor="telegram" className={classLabel}>
                        {t('createCoin.form.otherOptions.telegram.label')}
                      </label>
                      <input
                        type="text"
                        id="telegram"
                        name="telegram"
                        value={formData.telegram}
                        onChange={handleInputChange}
                        placeholder={t('createCoin.form.otherOptions.telegram.placeholder')}
                        className={classInput}
                      />
                    </div>

                    {/* Twitter */}
                    <div className="flex-1">
                      <label htmlFor="twitter" className={classLabel}>
                        {t('createCoin.form.otherOptions.twitter.label')}
                      </label>
                      <input
                        type="text"
                        id="twitter"
                        name="twitter"
                        value={formData.twitter}
                        onChange={handleInputChange}
                        placeholder={t('createCoin.form.otherOptions.twitter.placeholder')}
                        className={classInput}
                      />
                    </div>

                    {/* Website */}
                    <div className="flex-1">
                      <label htmlFor="website" className={classLabel}>
                        {t('createCoin.form.otherOptions.website.label')}
                      </label>
                      <input
                        type="text"
                        id="website"
                        name="website"
                        value={formData.website}
                        onChange={handleInputChange}
                        placeholder={t('createCoin.form.otherOptions.website.placeholder')}
                        className={classInput}
                      />
                      {errors.website && (
                        <p className="mt-1 text-xs text-red-500">
                          {t('createCoin.form.otherOptions.website.invalid')}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Submit Button - Fixed at bottom */}
              <div className="mt-8 pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full max-w-[400px] create-coin-bg hover:linear-200-bg hover-bg-delay dark:text-neutral-100 font-medium px-6 py-[6px] rounded-full transition-all duration-500 ease-in-out disabled:opacity-70 disabled:cursor-not-allowed mx-auto block"
                >
                  {isSubmitting ? t('createCoin.form.submit.creating') : t('createCoin.form.submit.create')}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-1/3 space-y-6 flex flex-col gap-2">
          {/* My Coins */}
          <div className="rounded-xl border p-6 shadow-lg border-my-coin flex-1 flex flex-col justify-between z-10">
            <div>
              <h2 className="text-center text-lg font-bold text-neutral-100 mb-4 flex items-center justify-center gap-2">
                {ethereumIcon(20, 20)}
                {t('createCoin.myCoins.title')}
                {ethereumIcon(20, 20)}
              </h2>

              <div className="flex justify-evenly mb-6">
                <button
                  onClick={() => setActiveTab("today")}
                  className={`text-sm ${activeTab === "today"
                      ? "text-theme-gradient-linear-start"
                      : "text-gray-400"
                    }`}
                >
                  {t('createCoin.myCoins.tabs.today')}
                </button>
                <button
                  onClick={() => setActiveTab("last8days")}
                  className={`text-gray-400 text-sm hover:text-gray-300 ${activeTab === "last8days"
                      ? "text-theme-gradient-linear-start"
                      : "text-gray-400"
                    }`}
                >
                  {t('createCoin.myCoins.tabs.last8days')}
                </button>
                <button
                  onClick={() => setActiveTab("lastmonth")}
                  className={`text-gray-400 text-sm hover:text-gray-300 ${activeTab === "lastmonth"
                      ? "text-theme-gradient-linear-start"
                      : "text-gray-400"
                    }`}
                >
                  {t('createCoin.myCoins.tabs.lastMonth')}
                </button>
              </div>
              {filteredMemeCoins.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <img src={"/no-list-token.png"} alt="no-coin-icon" width={180} height={180} />
                  <p className="text-neutral-100 mt-3 font-medium">
                    {t('createCoin.myCoins.noCoins')}
                  </p>
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto h-[78%]">
                  <div className="z-10">
                    {filteredMemeCoins.map((coin: TokenData, index: number) => (
                      <div
                        key={coin.token_id}
                        className="flex items-center justify-between hover:bg-theme-neutral-900 p-2 rounded-lg transition-colors duration-200"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-gray-300 rounded-full overflow-hidden">
                            <Image
                              src={coin.logo_url || "/user-icon.png"}
                              height={40}
                              width={40}
                              alt="Coin icon"
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <div className="font-medium">
                              {coin.name}{" "}
                              <span className="text-them-neutral-100">{coin.symbol}</span>
                            </div>
                            <div className="text-xs text-them-neutral-100">
                              {truncateString(coin.address, 12)}
                            </div>
                          </div>
                          <button 
                            className="text-them-neutral-100"
                            onClick={() => {
                              navigator.clipboard.writeText(coin.address);
                              notify({
                                message: "Address copied to clipboard!",
                                type: "success"
                              });
                            }}
                          >
                            <Copy size={18} />
                          </button>
                        </div>

                        <div className="flex items-center gap-3">
                          <button 
                            onClick={() => router.push(`/trading?address=${coin.address}`)}
                            className="linear-gradient-light dark:linear-gradient-connect hover:border py-2 px-5 border-gray-200 dark:border-t-theme-primary-300 dark:border-l-theme-primary-300 dark:border-b-theme-secondary-400 dark:border-r-theme-secondary-400 rounded-full text-xs"
                          >
                            {t('createCoin.myCoins.trade')}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}


            </div>

            <div className="mt-6 text-center">
              <button className="text-neutral-100 flex gap-2 items-center justify-center mx-auto hover:text-blue-400 transition-colors">
                <Link
                  href="/my-coin"
                  className="text-neutral-100 font-medium text-sm"
                >
                  {t('createCoin.myCoins.seeAll')}
                </Link>
                <img src={"/arrow.png"} alt="arrow-icon" width={15} height={14} />
              </button>
            </div>
          </div>

          {/* Guide */}
          <div className="bg-gradient-guide rounded-xl border p-6 shadow-lg border-my-coin">
            <h2 className="text-center text-lg font-bold text-neutral-100 mb-6 flex items-center justify-center gap-2">
              {ethereumIcon(20, 20)}
              {t('createCoin.guide.title')}
              {ethereumIcon(20, 20)}
            </h2>

            <ul className="space-y-4">
              {tArray('createCoin.guide.rules').map((rule: string, index: number) => (
                <li key={index} className="text-neutral-100 font-medium text-sm flex justify-center">
                  {rule}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}
