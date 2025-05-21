export const STYLE_TEXT_BASE = "text-gray-600 dark:text-neutral-200 text-sm font-normal"

export const SELECT_STYLES = {
    control: (base: any) => ({
        ...base,
        backgroundColor: document.documentElement.classList.contains("dark") 
            ? "#1E1E1E" 
            : "#fff",
        borderColor: document.documentElement.classList.contains("dark")
            ? "#8833EE"
            : "rgba(0, 0, 0, 0.1)",
        color: document.documentElement.classList.contains("dark")
            ? "#fff"
            : "#000",
        
        borderRadius: "1rem",
       
            
    }),
    menu: (base: any) => ({
        ...base,
        backgroundColor: document.documentElement.classList.contains("dark")
            ? "#1E1E1E"
            : "#fff",
        color: document.documentElement.classList.contains("dark")
            ? "#fff"
            : "#000",
        border: document.documentElement.classList.contains("dark")
            ? "1px solid rgba(255, 255, 255, 0.1)"
            : "1px solid rgba(0, 0, 0, 0.1)",
        borderRadius: "0.5rem",
        boxShadow: document.documentElement.classList.contains("dark")
            ? "0 4px 12px rgba(0, 0, 0, 0.3)"
            : "0 4px 12px rgba(0, 0, 0, 0.1)",
        marginTop: "0.5rem",
        overflow: "hidden",
        animation: "fadeIn 0.2s ease-in-out",
        zIndex: 9999,
    }),
    option: (base: any, state: any) => ({
        ...base,
        backgroundColor: state.isSelected
            ? (document.documentElement.classList.contains("dark")
                ? "#2a2a2a"
                : "#f0f0f0")
            : state.isFocused
                ? (document.documentElement.classList.contains("dark")
                    ? "#2a2a2a"
                    : "#f5f5f5")
                : "transparent",
        color: document.documentElement.classList.contains("dark")
            ? "#fff"
            : "#000",
        cursor: "pointer",
        padding: "8px 12px",
        fontSize: "0.875rem",
        ":active": {
            backgroundColor: document.documentElement.classList.contains("dark")
                ? "#2a2a2a"
                : "#f0f0f0",
        },
        "&:hover": {
            backgroundColor: document.documentElement.classList.contains("dark")
                ? "#2a2a2a !important"
                : "#f5f5f5 !important",
            color: document.documentElement.classList.contains("dark")
                ? "#fff !important"
                : "#000 !important",
        },
    }),
    multiValue: (base: any) => ({
        ...base,
        backgroundColor: document.documentElement.classList.contains("dark")
            ? "#2a2a2a"
            : "#f0f0f0",
        color: document.documentElement.classList.contains("dark")
            ? "#fff"
            : "#000",
        borderRadius: "0.375rem",
        padding: "0.125rem 0.25rem",
    }),
    multiValueLabel: (base: any) => ({
        ...base,
        color: document.documentElement.classList.contains("dark")
            ? "#fff"
            : "#000",
        fontWeight: "500",
        fontSize: "0.875rem",
        padding: "0.125rem 0.25rem",
    }),
    multiValueRemove: (base: any) => ({
        ...base,
        color: document.documentElement.classList.contains("dark")
            ? "#fff"
            : "#000",
        padding: "0.125rem 0.25rem",
        ":hover": {
            backgroundColor: document.documentElement.classList.contains("dark")
                ? "#3a3a3a"
                : "#e0e0e0",
            color: document.documentElement.classList.contains("dark")
                ? "#fff"
                : "#000",
        },
    }),
    singleValue: (base: any) => ({
        ...base,
        color: document.documentElement.classList.contains("dark")
            ? "#fff"
            : "#000",
        fontSize: "0.875rem",
    }),
    input: (base: any) => ({
        ...base,
        color: document.documentElement.classList.contains("dark")
            ? "#fff"
            : "#000",
        fontSize: "0.875rem",
    }),
    placeholder: (base: any) => ({
        ...base,
        color: document.documentElement.classList.contains("dark")
            ? "rgba(255, 255, 255, 0.5)"
            : "rgba(0, 0, 0, 0.5)",
        fontSize: "0.875rem",
    }),
    menuList: (base: any) => ({
        ...base,
        color: document.documentElement.classList.contains("dark")
            ? "#fff"
            : "#000",
        padding: "0.5rem",
        maxHeight: "300px",
        "&::-webkit-scrollbar": {
            width: "8px",
        },
        "&::-webkit-scrollbar-track": {
            background: document.documentElement.classList.contains("dark")
                ? "#1E1E1E"
                : "#f5f5f5",
            borderRadius: "4px",
        },
        "&::-webkit-scrollbar-thumb": {
            background: document.documentElement.classList.contains("dark")
                ? "#3a3a3a"
                : "#d0d0d0",
            borderRadius: "4px",
            "&:hover": {
                background: document.documentElement.classList.contains("dark")
                    ? "#4a4a4a"
                    : "#c0c0c0",
            },
        },
    }),
    noOptionsMessage: (base: any) => ({
        ...base,
        color: document.documentElement.classList.contains("dark")
            ? "rgba(255, 255, 255, 0.5)"
            : "rgba(0, 0, 0, 0.5)",
    }),
}

export const LAYOUT_CLASS = "bg-neutral-1000 box-shadow-info rounded-3xl flex flex-col" 