import { faXmark } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"

export default function TokenTicker({
    symbol,
    price,
    change,
    className,
    isShow = true
  }: {
    symbol: string
    price: string
    change: string,
    className?: string,
    isShow?: boolean
  }) {
    const isPositive = !change.startsWith("-")
  
    return (
      <div className={`flex items-center gap-2 bg-gray-100 dark:bg-neutral-800 rounded-xl px-3 py-1.5 max-h-[22px] text-xs ${className}`}>
        <span className="font-medium text-gray-900 dark:text-white">{symbol}</span>
        <span className="text-blue-600 dark:text-theme-primary-400">{price}</span>
        <span className={isPositive ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}>{change}</span>
        {/* {isShow && <FontAwesomeIcon icon={faXmark} width={12} className="text-gray-500 dark:text-gray-400"/>} */}
      </div>
    )
  }
  
