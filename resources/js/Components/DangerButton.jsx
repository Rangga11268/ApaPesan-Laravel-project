export default function DangerButton({
    className = "",
    disabled = false,
    children,
    ...props
}) {
    return (
        <button
            {...props}
            disabled={disabled}
            className={
                `inline-flex items-center justify-center min-h-[44px] rounded-xl border border-transparent bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition-all duration-150 ease-in-out hover:bg-red-500 active:bg-red-700 shadow-xs hover:shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-surface cursor-pointer select-none ${
                    disabled ? "opacity-50 cursor-not-allowed" : ""
                } ` + className
            }
        >
            {children}
        </button>
    );
}
