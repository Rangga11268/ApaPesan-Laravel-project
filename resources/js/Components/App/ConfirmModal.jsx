import { useState, useEffect, useCallback, createContext, useContext } from "react";
import {
    Dialog,
    DialogPanel,
    DialogTitle,
    DialogDescription,
    Transition,
    TransitionChild,
} from "@headlessui/react";
import {
    ExclamationTriangleIcon,
    ExclamationCircleIcon,
    InformationCircleIcon,
    XMarkIcon,
} from "@heroicons/react/24/outline";

// Global reference for Promise-based imperative calls (confirm / alert)
let globalDialogDispatcher = null;

export const confirm = (options) => {
    const opts = typeof options === "string" ? { message: options } : options;
    if (globalDialogDispatcher) {
        return globalDialogDispatcher({
            ...opts,
            isConfirm: true,
        });
    }
    // Fallback if modal is not yet mounted
    return Promise.resolve(window.confirm(opts.message || opts.title || ""));
};

export const alert = (options) => {
    const opts = typeof options === "string" ? { message: options } : options;
    if (globalDialogDispatcher) {
        return globalDialogDispatcher({
            ...opts,
            isConfirm: false,
        });
    }
    // Fallback if modal is not yet mounted
    window.alert(opts.message || opts.title || "");
    return Promise.resolve();
};

export const useConfirm = () => {
    return { confirm, alert };
};

/**
 * Custom accessible Alert & Confirm Modal component.
 * Mount this component in root layouts (AuthenticatedLayout, GuestLayout).
 */
export default function ConfirmModal() {
    const [state, setState] = useState(null);

    const openDialog = useCallback((config) => {
        return new Promise((resolve) => {
            setState({
                ...config,
                resolve,
            });
        });
    }, []);

    useEffect(() => {
        globalDialogDispatcher = openDialog;
        return () => {
            if (globalDialogDispatcher === openDialog) {
                globalDialogDispatcher = null;
            }
        };
    }, [openDialog]);

    const handleConfirm = () => {
        if (!state) return;
        state.resolve(true);
        setState(null);
    };

    const handleCancel = () => {
        if (!state) return;
        state.resolve(false);
        setState(null);
    };

    if (!state) return null;

    const {
        title = state.isConfirm ? "Konfirmasi Tindakan" : "Pemberitahuan",
        message = "",
        confirmText = state.isConfirm ? "Ya, Lanjutkan" : "Mengerti",
        cancelText = "Batal",
        variant = state.isConfirm ? "danger" : "primary",
        isConfirm = true,
    } = state;

    const variantStyles = {
        danger: {
            iconBg: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
            icon: ExclamationTriangleIcon,
            btnClass:
                "bg-red-600 hover:bg-red-700 text-white focus-visible:ring-red-500",
        },
        warning: {
            iconBg: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
            icon: ExclamationCircleIcon,
            btnClass:
                "bg-amber-600 hover:bg-amber-700 text-white focus-visible:ring-amber-500",
        },
        primary: {
            iconBg: "bg-primary/10 text-primary border-primary/20",
            icon: InformationCircleIcon,
            btnClass:
                "bg-primary hover:bg-primary-hover text-white focus-visible:ring-primary",
        },
        info: {
            iconBg: "bg-primary/10 text-primary border-primary/20",
            icon: InformationCircleIcon,
            btnClass:
                "bg-primary hover:bg-primary-hover text-white focus-visible:ring-primary",
        },
    }[variant] || {
        iconBg: "bg-primary/10 text-primary border-primary/20",
        icon: InformationCircleIcon,
        btnClass: "bg-primary hover:bg-primary-hover text-white focus-visible:ring-primary",
    };

    const IconComponent = variantStyles.icon;

    return (
        <Transition show={Boolean(state)} appear>
            <Dialog
                as="div"
                className="relative z-50 focus:outline-hidden"
                onClose={handleCancel}
            >
                {/* Backdrop */}
                <TransitionChild
                    enter="ease-out duration-200"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-150"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity" />
                </TransitionChild>

                <div className="fixed inset-0 z-10 w-screen overflow-y-auto p-4 flex min-h-full items-center justify-center">
                    <TransitionChild
                        enter="ease-out duration-200"
                        enterFrom="opacity-0 scale-95 translate-y-2"
                        enterTo="opacity-100 scale-100 translate-y-0"
                        leave="ease-in duration-150"
                        leaveFrom="opacity-100 scale-100 translate-y-0"
                        leaveTo="opacity-0 scale-95 translate-y-2"
                    >
                        <DialogPanel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-surface border border-border p-6 shadow-xl transition-all text-main">
                            <div className="flex items-start gap-4">
                                <div
                                    className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border ${variantStyles.iconBg}`}
                                >
                                    <IconComponent className="w-6 h-6" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <DialogTitle
                                        as="h3"
                                        className="text-base font-semibold text-main leading-6"
                                    >
                                        {title}
                                    </DialogTitle>
                                    {message && (
                                        <DialogDescription className="mt-2 text-sm text-muted leading-relaxed">
                                            {message}
                                        </DialogDescription>
                                    )}
                                </div>
                            </div>

                            <div className="mt-6 flex items-center justify-end gap-3">
                                {isConfirm && (
                                    <button
                                        type="button"
                                        onClick={handleCancel}
                                        className="min-h-[40px] px-4 py-2 rounded-xl text-sm font-medium text-main bg-surface-elevated hover:bg-surface border border-border transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-border"
                                    >
                                        {cancelText}
                                    </button>
                                )}
                                <button
                                    type="button"
                                    onClick={handleConfirm}
                                    autoFocus
                                    className={`min-h-[40px] px-4 py-2 rounded-xl text-sm font-medium transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-offset-2 ${variantStyles.btnClass}`}
                                >
                                    {confirmText}
                                </button>
                            </div>
                        </DialogPanel>
                    </TransitionChild>
                </div>
            </Dialog>
        </Transition>
    );
}
