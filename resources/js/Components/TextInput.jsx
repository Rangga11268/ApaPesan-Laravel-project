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
                "min-h-[44px] py-2.5 px-3 rounded-xl bg-surface text-main border border-border placeholder:text-muted/60 focus:border-border-active focus:ring-1 focus:ring-border-active shadow-sm transition-colors duration-200 outline-none " +
                className
            }
            ref={input}
        />
    );
});
