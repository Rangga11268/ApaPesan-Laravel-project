export default function InputLabel({
    value,
    className = "",
    children,
    ...props
}) {
    return (
        <label
            {...props}
            className={
                `block text-sm font-medium text-slate-700 dark:text-gray-300 tracking-wide ` +
                className
            }
        >
            {value ? value : children}
        </label>
    );
}
