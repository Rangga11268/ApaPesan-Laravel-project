import { forwardRef, useEffect, useRef } from "react";

export default forwardRef(function TextInput(
    { type = "text", className = "", isFocused = false, ...props },
    ref
) {
    const input = ref ? ref : useRef();

    useEffect(() => {
        if (isFocused) {
            input.current.focus();
        }
    }, []);

    return (
        <input
            {...props}
            type={type}
            className={
                "glass-input border-gray-700 bg-gray-900/50 text-gray-100 focus:border-primary-500 focus:ring-primary-500 rounded-md shadow-sm " +
                className
            }
            ref={input}
        />
    );
});
