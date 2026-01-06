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
                "glass-input border-white/10 bg-black/20 text-white focus:border-primary-500 focus:ring-primary-500 rounded-xl shadow-sm transition-all duration-300 " +
                className
            }
            ref={input}
        />
    );
});
