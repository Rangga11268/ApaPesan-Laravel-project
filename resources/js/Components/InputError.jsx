import { ExclamationCircleIcon } from "@heroicons/react/20/solid";

export default function InputError({ message, className = "", ...props }) {
    return message ? (
        <p
            role="alert"
            {...props}
            className={
                "text-xs font-medium text-rose-600 dark:text-rose-400 flex items-center gap-1.5 mt-1.5 transition-opacity duration-150 " +
                className
            }
        >
            <ExclamationCircleIcon className="w-4 h-4 shrink-0 text-rose-500 dark:text-rose-400" aria-hidden="true" />
            <span>{message}</span>
        </p>
    ) : null;
}
