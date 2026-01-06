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
                `block text-sm font-medium text-gray-400 tracking-wide ` +
                className
            }
        >
            {value ? value : children}
        </label>
    );
}
