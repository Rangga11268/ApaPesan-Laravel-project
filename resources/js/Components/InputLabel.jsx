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
                `block text-sm font-semibold text-main tracking-normal ` +
                className
            }
        >
            {value ? value : children}
        </label>
    );
}
