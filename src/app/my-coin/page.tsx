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
        <div className="container-body px-[40px] flex flex-col pt-[30px] relative mx-auto z-10">
            <div className="pb-6 flex items-center justify-between">
                <div className="flex w-full items-center justify-center gap-4">
                    <h2 className="text-xl font-bold text-black dark:text-neutral-100 flex items-center gap-2 flex-1">
                        <img src={"/ethereum.png"} alt="ethereum-icon" width={24} height={24} />
                        MY COINS
                        <img src={"/ethereum.png"} alt="ethereum-icon" width={24} height={24} />
                        <span className="ml-2 text-neutral-400 dark:text-neutral-400 text-sm">({sortedAndFilteredCoins.length})</span>
                    </h2>

                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 dark:text-neutral-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Token Name/ Address"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="rounded-full py-2 pl-10 pr-4 w-64 text-sm focus:outline-none bg-gray-100 dark:bg-black text-gray-900 dark:text-neutral-200 focus:ring-1 focus:ring-blue-500 dark:focus:ring-[hsl(var(--ring))] max-h-[30px] border border-gray-200 dark:border-t-theme-primary-300 dark:border-l-theme-primary-300 dark:border-b-theme-secondary-400 dark:border-r-theme-secondary-400 placeholder:text-gray-500 dark:placeholder:text-neutral-400"
                        />
                    </div>

                    <button
                        onClick={handleCreateCoin}
                        className="linear-gradient-light dark:create-coin-bg hover:linear-200-bg hover-bg-delay text-black dark:text-neutral-100 text-sm font-medium px-6 py-[6px] rounded-full transition-all duration-500 ease-in-out disabled:opacity-70 disabled:cursor-not-allowed block "
                    >
                        CREATE COIN
                    </button>
                </div>
            </div>
            <Card className="border-none ">
                <CardContent className="px-2 relative">
                    <div className="overflow-hidden rounded-xl border-1 z-10 border-solid border-y-theme-primary-300 border-x-theme-secondary-400">
                        <Table>
                            <TableHeader className="border-b-1 border-b-solid border-b-theme-secondary-300/30">
                                <TableRow className="h-[38px] bg-neutral-100/50 dark:bg-neutral-800/50">
                                    <TableHead
                                        className={`text-neutral-600 dark:text-neutral-300 font-normal text-xs text-center cursor-pointer hover:bg-neutral-200/50 dark:hover:bg-neutral-700/50 transition-colors`}
                                        onClick={() => handleSort("time")}
                                    >
                                        <div className="flex items-center justify-start gap-1 pl-4">
                                            Time
                                            {renderSortIcon("time")}
                                        </div>
                                    </TableHead>
                                    <TableHead
                                        className={`text-neutral-600 dark:text-neutral-300 font-normal text-xs text-center cursor-pointer hover:bg-neutral-200/50 dark:hover:bg-neutral-700/50 transition-colors`}
                                        onClick={() => handleSort("name")}
                                    >
                                        <div className="flex items-center justify-start gap-1">
                                            Meme coin
                                            {renderSortIcon("name")}
                                        </div>
                                    </TableHead>
                                    <TableHead
                                        className={`text-neutral-600 dark:text-neutral-300 font-normal text-xs text-center cursor-pointer hover:bg-neutral-200/50 dark:hover:bg-neutral-700/50 transition-colors`}
                                        onClick={() => handleSort("symbol")}
                                    >
                                        <div className="flex items-center justify-start gap-1">
                                            Symbol
                                            {renderSortIcon("symbol")}
                                        </div>
                                    </TableHead>
                                    <TableHead className="text-neutral-600 dark:text-neutral-300 font-normal text-xs text-center">Address</TableHead>
                                    <TableHead
                                        className={`text-neutral-600 dark:text-neutral-300 font-normal text-xs text-center cursor-pointer hover:bg-neutral-200/50 dark:hover:bg-neutral-700/50 transition-colors`}
                                        onClick={() => handleSort("decimals")}
                                    >
                                        <div className="flex items-center justify-start gap-1">
                                            Decimals
                                            {renderSortIcon("decimals")}
                                        </div>
                                    </TableHead>
                                    <TableHead className="text-neutral-600 dark:text-neutral-300 font-normal text-xs text-center">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {sortedAndFilteredCoins.map((coin) => (
                                    <TableRow
                                        key={coin.id}
                                        className="hover:bg-neutral-200/50 dark:hover:bg-neutral-700/50 ease-linear transition-all duration-300"
                                    >
                                        <TableCell className="text-neutral-700 dark:text-neutral-200 text-xs font-normal text-center">
                                            <div className="flex flex-col items-start pl-4">
                                                <div>{coin.time}</div>
                                                <div className="text-neutral-500 dark:text-neutral-400 text-xs">{coin.date}</div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="h-[48px]">
                                            <div className="flex items-center justify-start gap-3">
                                                <div className="w-8 h-8 rounded-full overflow-hidden bg-neutral-200 dark:bg-neutral-700 flex-shrink-0">
                                                    <img
                                                        src={coin.logo}
                                                        alt={coin.name}
                                                        width={32}
                                                        height={32}
                                                        className="object-cover"
                                                    />
                                                </div>
                                                <span className="text-neutral-700 dark:text-neutral-200 text-xs font-normal">{coin.name}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-neutral-700 dark:text-neutral-200 text-xs font-normal text-left uppercase">{coin.symbol}</TableCell>
                                        <TableCell className="h-[48px]">
                                            <div className="flex items-center justify-center gap-2">
                                                <span className="text-neutral-700 dark:text-neutral-200 text-xs font-normal">{coin.address}</span>
                                                <button
                                                    onClick={(e) => copyToClipboard(coin.address, e)}
                                                    className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 transition-colors p-1"
                                                >
                                                    <Copy className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-neutral-700 dark:text-neutral-200 text-xs font-normal text-left">{coin.decimals}</TableCell>
                                        <TableCell className="text-center">
                                            <button className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 transition-colors">
                                                <Image src={convertIcon} alt="convert" width={21} height={20} />
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
