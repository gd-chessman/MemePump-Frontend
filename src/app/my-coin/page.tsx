"use client"

import { useState, useMemo } from "react"
import { Copy, ArrowUpDown, ExternalLink, Search } from "lucide-react"
import Image from "next/image"
import ethereum from "@/assets/svgs/ethereum-icon.svg"
import { CardContent } from "@/ui/card"
import token from "@/assets/svgs/token.svg"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/ui/table";
import { Card } from "@/ui/card";
import { TiArrowSortedDown, TiArrowSortedUp } from "react-icons/ti";
import convertIcon from "@/assets/svgs/convert-icon.svg"
import { useRouter } from "next/navigation";
import { getMyTokens } from "@/services/api/TelegramWalletService"
import { useQuery } from "@tanstack/react-query"

type CoinData = {
    id: string
    time: string
    date: string
    name: string
    logo: string
    symbol: string
    address: string
    decimals: number
}

type MemeCoinData = {
    token_id: number;
    created_at: string;
    name: string;
    logo_url: string;
    symbol: string;
    address: string;
    decimals: number;
}


type SortField = "time" | "name" | "symbol" | "address" | "decimals"
type SortDirection = "asc" | "desc"

export default function MyCoinsTable() {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState("")
    const [sortField, setSortField] = useState<SortField>("time")
    const [sortDirection, setSortDirection] = useState<SortDirection>("desc")

    const { data: memeCoins = [] } = useQuery({
        queryKey: ["my-tokens"],
        queryFn: getMyTokens,
    });

    // Transform API data into table format
    const coins: CoinData[] = useMemo(() => {
        return memeCoins.map((coin: MemeCoinData) => {
            const createdDate = new Date(coin.created_at);
            return {
                id: coin.token_id.toString(),
                time: createdDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
                date: createdDate.toLocaleDateString('en-US', { day: '2-digit', month: '2-digit', year: 'numeric' }),
                name: coin.name,
                logo: coin.logo_url || token,
                symbol: coin.symbol,
                address: coin.address,
                decimals: coin.decimals,
            };
        });
    }, [memeCoins]);

    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortDirection(sortDirection === "asc" ? "desc" : "asc")
        } else {
            setSortField(field)
            setSortDirection("asc")
        }
    }

    const sortedAndFilteredCoins = useMemo(() => {
        let filtered = coins

        if (searchQuery) {
            const query = searchQuery.toLowerCase()
            filtered = coins.filter(
                (coin) =>
                    coin.name.toLowerCase().includes(query) ||
                    coin.symbol.toLowerCase().includes(query) ||
                    coin.address.toLowerCase().includes(query),
            )
        }

        return [...filtered].sort((a, b) => {
            let comparison = 0

            switch (sortField) {
                case "time":
                    comparison = `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`)
                    break
                case "name":
                    comparison = a.name.localeCompare(b.name)
                    break
                case "symbol":
                    comparison = a.symbol.localeCompare(b.symbol)
                    break
                case "address":
                    comparison = a.address.localeCompare(b.address)
                    break
                case "decimals":
                    comparison = a.decimals - b.decimals
                    break
            }

            return sortDirection === "asc" ? comparison : -comparison
        })
    }, [coins, searchQuery, sortField, sortDirection])

    const copyToClipboard = async (text: string, e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent event bubbling
        try {
            await navigator.clipboard.writeText(text);
            // You could add a toast notification here to show success
            console.log('Copied to clipboard:', text);
        } catch (err) {
            console.error('Failed to copy text: ', err);
        }
    };

    const renderSortIcon = (field: SortField) => {
        return (
            <div className="flex flex-col h-5">
                <TiArrowSortedUp
                    className={`${sortField === field && sortDirection === "asc" ? "text-blue-500" : "text-muted-foreground"}`}
                />
                <TiArrowSortedDown
                    className={`-mt-1.5 ${sortField === field && sortDirection === "desc" ? "text-blue-500" : "text-muted-foreground"}`}
                />
            </div>
        );
    };

    const handleCreateCoin = () => {
        router.push('/create-coin');
    };

    return (
        <div className="lg:container-body px-3 md:px-6 lg:px-[40px] flex flex-col pt-4 md:pt-6 lg:pt-[30px] relative mx-auto z-10">
            <div className="pb-4 md:pb-6 flex flex-col md:flex-row justify-between gap-3 md:gap-4">
                <div className="flex flex-col md:flex-row w-full items-center justify-between gap-3 md:gap-4">
                    {/* Mobile layout */}
                    <div className="flex md:hidden items-center justify-between w-full gap-2">
                        <h2 className="text-base font-bold text-black dark:text-neutral-100 flex items-center gap-1.5">
                            <img src={"/ethereum.png"} alt="ethereum-icon" width={18} height={18} />
                            MY COINS
                            <img src={"/ethereum.png"} alt="ethereum-icon" width={18} height={18} />
                            <span className="ml-1.5 text-neutral-400 dark:text-neutral-400 text-xs">({sortedAndFilteredCoins.length})</span>
                        </h2>

                        <button
                            onClick={handleCreateCoin}
                            className="linear-gradient-light dark:create-coin-bg hover:linear-200-bg hover-bg-delay text-black dark:text-neutral-100 text-xs font-medium px-3 py-1 rounded-full transition-all duration-500 ease-in-out disabled:opacity-70 disabled:cursor-not-allowed whitespace-nowrap"
                        >
                            CREATE COIN
                        </button>
                    </div>

                    {/* Desktop layout */}
                    <h2 className="hidden md:flex text-lg lg:text-xl font-bold text-black dark:text-neutral-100 items-center gap-2 flex-1 md:flex-none">
                        <img src={"/ethereum.png"} alt="ethereum-icon" width={24} height={24} />
                        MY COINS
                        <img src={"/ethereum.png"} alt="ethereum-icon" width={24} height={24} />
                        <span className="ml-2 text-neutral-400 dark:text-neutral-400 text-sm">({sortedAndFilteredCoins.length})</span>
                    </h2>

                    <div className="relative w-full md:w-auto">
                        <Search className="absolute left-2.5 md:left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 dark:text-neutral-400 w-3.5 h-3.5 md:w-4 md:h-4" />
                        <input
                            type="text"
                            placeholder="Token Name/ Address"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="rounded-full py-1.5 md:py-2 pl-8 md:pl-10 pr-3 md:pr-4 w-full md:w-64 text-xs md:text-sm focus:outline-none bg-gray-100 dark:bg-black text-gray-900 dark:text-neutral-200 focus:ring-1 focus:ring-blue-500 dark:focus:ring-[hsl(var(--ring))] max-h-[28px] md:max-h-[30px] border border-gray-200 dark:border-t-theme-primary-300 dark:border-l-theme-primary-300 dark:border-b-theme-secondary-400 dark:border-r-theme-secondary-400 placeholder:text-gray-500 dark:placeholder:text-neutral-400"
                        />
                    </div>

                    {/* Desktop button */}
                    <button
                        onClick={handleCreateCoin}
                        className="hidden md:block linear-gradient-light dark:create-coin-bg hover:linear-200-bg hover-bg-delay text-black dark:text-neutral-100 text-sm font-medium px-6 py-[6px] rounded-full transition-all duration-500 ease-in-out disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        CREATE COIN
                    </button>
                </div>
            </div>

            <Card className="border-none">
                <CardContent className="px-1 md:px-2 relative">
                    <div className="overflow-x-auto md:overflow-hidden rounded-lg md:rounded-xl border-1 z-10 border-solid border-y-theme-primary-300 border-x-theme-secondary-400">
                        <Table>
                            <TableHeader className="border-b-1 border-b-solid border-b-theme-secondary-300/30">
                                <TableRow className="h-[32px] md:h-[38px] bg-neutral-100/50 dark:bg-neutral-800/50">
                                    <TableHead
                                        className={`text-neutral-600 dark:text-neutral-300 font-normal text-[10px] md:text-xs text-center cursor-pointer hover:bg-neutral-200/50 dark:hover:bg-neutral-700/50 transition-colors whitespace-nowrap`}
                                        onClick={() => handleSort("time")}
                                    >
                                        <div className="flex items-center justify-start gap-0.5 md:gap-1 pl-2 md:pl-4">
                                            Time
                                            {renderSortIcon("time")}
                                        </div>
                                    </TableHead>
                                    <TableHead
                                        className={`text-neutral-600 dark:text-neutral-300 font-normal text-[10px] md:text-xs text-center cursor-pointer hover:bg-neutral-200/50 dark:hover:bg-neutral-700/50 transition-colors whitespace-nowrap`}
                                        onClick={() => handleSort("name")}
                                    >
                                        <div className="flex items-center justify-start gap-0.5 md:gap-1">
                                            Meme coin
                                            {renderSortIcon("name")}
                                        </div>
                                    </TableHead>
                                    <TableHead
                                        className={`text-neutral-600 dark:text-neutral-300 font-normal text-[10px] md:text-xs text-center cursor-pointer hover:bg-neutral-200/50 dark:hover:bg-neutral-700/50 transition-colors whitespace-nowrap`}
                                        onClick={() => handleSort("symbol")}
                                    >
                                        <div className="flex items-center justify-start gap-0.5 md:gap-1">
                                            Symbol
                                            {renderSortIcon("symbol")}
                                        </div>
                                    </TableHead>
                                    <TableHead className="text-neutral-600 dark:text-neutral-300 font-normal text-[10px] md:text-xs text-center whitespace-nowrap">Address</TableHead>
                                    <TableHead
                                        className={`text-neutral-600 dark:text-neutral-300 font-normal text-[10px] md:text-xs text-center cursor-pointer hover:bg-neutral-200/50 dark:hover:bg-neutral-700/50 transition-colors whitespace-nowrap`}
                                        onClick={() => handleSort("decimals")}
                                    >
                                        <div className="flex items-center justify-start gap-0.5 md:gap-1">
                                            Decimals
                                            {renderSortIcon("decimals")}
                                        </div>
                                    </TableHead>
                                    <TableHead className="text-neutral-600 dark:text-neutral-300 font-normal text-[10px] md:text-xs text-center whitespace-nowrap">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {sortedAndFilteredCoins.map((coin) => (
                                    <TableRow
                                        key={coin.id}
                                        className="hover:bg-neutral-200/50 dark:hover:bg-neutral-700/50 ease-linear transition-all duration-300"
                                    >
                                        <TableCell className="text-neutral-700 dark:text-neutral-200 text-[10px] md:text-xs font-normal text-center">
                                            <div className="flex flex-col items-start pl-2 md:pl-4">
                                                <div>{coin.time}</div>
                                                <div className="text-neutral-500 dark:text-neutral-400 text-[10px] md:text-xs">{coin.date}</div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="h-[40px] md:h-[48px]">
                                            <div className="flex items-center justify-start gap-2 md:gap-3">
                                                <div className="w-6 h-6 md:w-8 md:h-8 rounded-full overflow-hidden bg-neutral-200 dark:bg-neutral-700 flex-shrink-0">
                                                    <img
                                                        src={coin.logo}
                                                        alt={coin.name}
                                                        width={32}
                                                        height={32}
                                                        className="object-cover"
                                                    />
                                                </div>
                                                <span className="text-neutral-700 dark:text-neutral-200 text-[10px] md:text-xs font-normal truncate max-w-[80px] md:max-w-none">{coin.name}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-neutral-700 dark:text-neutral-200 text-[10px] md:text-xs font-normal text-left uppercase">{coin.symbol}</TableCell>
                                        <TableCell className="h-[40px] md:h-[48px]">
                                            <div className="flex items-center justify-center gap-1 md:gap-2">
                                                <span className="text-neutral-700 dark:text-neutral-200 text-[10px] md:text-xs font-normal truncate max-w-[60px] md:max-w-none">{coin.address}</span>
                                                <button
                                                    onClick={(e) => copyToClipboard(coin.address, e)}
                                                    className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 transition-colors p-0.5 md:p-1"
                                                >
                                                    <Copy className="h-3.5 w-3.5 md:h-4 md:w-4" />
                                                </button>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-neutral-700 dark:text-neutral-200 text-[10px] md:text-xs font-normal text-left">{coin.decimals}</TableCell>
                                        <TableCell className="text-center">
                                            <button className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 transition-colors">
                                                <Image src={convertIcon} alt="convert" width={16} height={16} className="md:w-[21px] md:h-[20px]" />
                                            </button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
