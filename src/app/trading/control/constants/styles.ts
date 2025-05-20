export const STYLE_TEXT_BASE = "text-gray-600 dark:text-neutral-200 text-sm font-normal"

export const SELECT_STYLES = {
    control: (base: any) => ({
        ...base,
        backgroundColor: "hsl(var(--background))",
        borderColor: "hsl(var(--input))",
        color: "hsl(var(--foreground))",
        "&:hover": {
            borderColor: "hsl(var(--input))",
        },
    }),
    menu: (base: any) => ({
        ...base,
        backgroundColor: "#333",
        color: "hsl(var(--foreground))",
        border: "1px solid hsl(var(--input))",
        borderRadius: "0.5rem",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
        marginTop: "0.5rem",
        overflow: "hidden",
        animation: "fadeIn 0.2s ease-in-out",
        zIndex: 9999,
        "&:before": {
            content: '""',
            position: "absolute",
            top: "-1px",
            left: "-1px",
            right: "-1px",
            height: "1px",
            background: "linear-gradient(90deg, hsl(var(--primary)), hsl(var(--accent)))",
            opacity: 0.5,
        },
    }),
    option: (base: any, state: any) => ({
        ...base,
        backgroundColor: state.isSelected
            ? "hsl(var(--primary))"
            : state.isFocused
                ? "hsl(var(--accent))"
                : "transparent",
        color: state.isSelected
            ? document.documentElement.classList.contains("dark")
                ? "#fff"
                : "#000"
            : "hsl(var(--foreground))",
        "&:hover": {
            backgroundColor: "hsl(var(--accent))",
            color: "hsl(var(--foreground))",
        },
    }),
    multiValue: (base: any) => ({
        ...base,
        backgroundColor: "hsl(var(--primary))",
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
            backgroundColor: "hsl(var(--destructive))",
            color: "white",
        },
    }),
    singleValue: (base: any) => ({
        ...base,
        color: "hsl(var(--foreground))",
        fontSize: "0.875rem",
    }),
    input: (base: any) => ({
        ...base,
        color: "hsl(var(--foreground))",
        fontSize: "0.875rem",
    }),
    placeholder: (base: any) => ({
        ...base,
        color: "hsl(var(--muted-foreground))",
        fontSize: "0.875rem",
    }),
    menuList: (base: any) => ({
        ...base,
        color: "hsl(var(--foreground))",
        padding: "0.5rem",
        maxHeight: "300px",
        "&::-webkit-scrollbar": {
            width: "8px",
        },
        "&::-webkit-scrollbar-track": {
            background: "hsl(var(--background))",
            borderRadius: "4px",
        },
        "&::-webkit-scrollbar-thumb": {
            background: "hsl(var(--muted-foreground))",
            borderRadius: "4px",
            "&:hover": {
                background: "hsl(var(--foreground))",
            },
        },
    }),
    noOptionsMessage: (base: any) => ({
        ...base,
        color: "hsl(var(--muted-foreground))",
    }),
}

export const LAYOUT_CLASS = "bg-neutral-1000 box-shadow-info rounded-3xl flex flex-col" 