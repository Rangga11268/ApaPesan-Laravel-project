export default function SecondaryButton({
    type = "button",
    className = "",
    disabled = false,
    children,
    ...props
}) {
    return (
        <button
            {...props}
            type={type}
            disabled={disabled}
            className={
                `inline-flex items-center justify-center min-h-[44px] rounded-xl border border-border bg-surface px-5 py-2.5 text-sm font-semibold text-main transition-all duration-150 ease-in-out hover:bg-surface-elevated hover:border-border-active focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-surface shadow-xs hover:shadow-sm cursor-pointer select-none ${
                    disabled ? "opacity-50 cursor-not-allowed" : ""
                } ` + className
            }
        >
            {children}
        </button>
    );
}
