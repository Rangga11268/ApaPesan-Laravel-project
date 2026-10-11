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
                `block text-sm font-medium text-main/90 tracking-normal ` +
                className
            }
        >
            {value ? value : children}
        </label>
    );
}
