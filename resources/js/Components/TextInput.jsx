import { forwardRef, useEffect, useRef, useState, useImperativeHandle } from "react";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

export default forwardRef(function TextInput(
    {
        type = "text",
        className = "",
        isFocused = false,
        showPasswordToggle = type === "password",
        ...props
    },
    ref
) {
    const localRef = useRef(null);
    useImperativeHandle(ref, () => localRef.current);

    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        if (isFocused && localRef.current) {
            localRef.current.focus();
        }
    }, [isFocused]);

    const isPasswordType = type === "password";
    const actualType = isPasswordType && showPassword ? "text" : type;

    const baseInput = (
        <input
            {...props}
            type={actualType}
            className={
                "min-h-[44px] py-2.5 px-3 rounded-xl bg-surface text-main border border-border placeholder:text-muted/60 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 shadow-xs transition-colors duration-150 outline-none " +
                (isPasswordType && showPasswordToggle ? " pr-11 " : " ") +
                className
            }
            ref={localRef}
        />
    );

    if (isPasswordType && showPasswordToggle) {
        return (
            <div className="relative w-full">
                {baseInput}
                <button
                    type="button"
                    tabIndex={0}
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-muted hover:text-main hover:bg-surface-elevated/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 transition-colors"
                    aria-label={
                        showPassword
                            ? "Sembunyikan kata sandi"
                            : "Tampilkan kata sandi"
                    }
                    title={
                        showPassword
                            ? "Sembunyikan kata sandi"
                            : "Tampilkan kata sandi"
                    }
                >
                    {showPassword ? (
                        <EyeSlashIcon className="w-5 h-5" aria-hidden="true" />
                    ) : (
                        <EyeIcon className="w-5 h-5" aria-hidden="true" />
                    )}
                </button>
            </div>
        );
    }

    return baseInput;
});
