import React from 'react'
import { Check, Pencil } from 'lucide-react'

interface AmountButtonsProps {
    amountValues: number[]
    onSetAmount: (value: number) => void
    onEditClick: (index: number) => void
    onEditSave: (index: number) => void
    editingIndex: number | null
    editValue: string
    setEditValue: (value: string) => void
    onEditKeyPress: (e: React.KeyboardEvent, index: number) => void
}

export const AmountButtons: React.FC<AmountButtonsProps> = ({
    amountValues,
    onSetAmount,
    onEditClick,
    onEditSave,
    editingIndex,
    editValue,
    setEditValue,
    onEditKeyPress,
}) => {
    return (
        <div className="flex flex-col gap-1">
            <span className="text-gray-600 dark:text-neutral-200 text-sm font-normal">SOL</span>
            <div className="flex items-center justify-between gap-3">
                {amountValues.map((value, index) => (
                    <div key={index} className="relative w-full">
                        {editingIndex === index ? (
                            <div className="flex items-center gap-1 bg-gray-100 dark:bg-neutral-700 rounded-md">
                                <input
                                    type="number"
                                    value={editValue}
                                    onChange={(e) => setEditValue(e.target.value)}
                                    onKeyDown={(e) => onEditKeyPress(e, index)}
                                    className="w-full bg-transparent text-gray-900 dark:text-neutral-200 px-2 py-1 rounded-md focus:outline-none text-xs"
                                    min="0.000001"
                                    step="0.000001"
                                    autoFocus
                                />
                                <button
                                    onClick={() => onEditSave(index)}
                                    className="p-1 text-blue-600 hover:text-blue-700 dark:text-theme-primary-300 dark:hover:text-theme-primary-400"
                                >
                                    <Check className="w-4 h-4" />
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={() => onSetAmount(value)}
                                className="px-1 w-full h-[30px] rounded-md flex items-center justify-between gap-1 border border-solid border-gray-200 dark:border-neutral-700 text-xs font-semibold text-gray-700 dark:text-neutral-300 hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors"
                            >
                                {value}
                                <Pencil
                                    className="w-4 h-4 cursor-pointer hover:opacity-80 text-gray-500 dark:text-neutral-400"
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        onEditClick(index)
                                    }}
                                />
                            </button>
                        )}
                    </div>
                ))}
            </div>
        </div>
    )
} 
