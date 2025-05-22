import React from 'react'
import Select from 'react-select'
import { SELECT_STYLES } from '../constants/styles'
import { useLang } from '@/lang/useLang'

interface GroupSelectProps {
    groups: any[]
    selectedGroups: string[]
    setSelectedGroups: (groups: string[]) => void
}

export const GroupSelect: React.FC<GroupSelectProps> = ({
    groups,
    selectedGroups,
    setSelectedGroups,
}) => {
    const { t } = useLang()

    const options = groups
        ?.filter((group) => group.mg_status === "on")
        .map((group) => ({
            value: group.mg_id.toString(),
            label: group.mg_name,
        }))

    const value = groups
        ?.filter((group) => group.mg_status === "on")
        .filter((group) => selectedGroups.includes(group.mg_id.toString()))
        .map((group) => ({
            value: group.mg_id.toString(),
            label: group.mg_name,
        }))

    return (
        <div className="relative mt-3">
            <Select
                isMulti
                options={options}
                value={value}
                onChange={(selectedOptions) => {
                    const selectedValues = selectedOptions
                        ? selectedOptions.map((option) => option.value)
                        : []
                    setSelectedGroups(selectedValues)
                }}
                className="react-select-container"
                classNamePrefix="react-select"
                placeholder={t('trading.panel.selectGroups')}
                noOptionsMessage={() => t('trading.panel.noGroupsAvailable')}
                menuPlacement="top"
                styles={SELECT_STYLES}
            />
        </div>
    )
} 
