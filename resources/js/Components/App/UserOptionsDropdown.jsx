import { Menu, Transition } from "@headlessui/react";
import {
    EllipsisVerticalIcon,
    LockClosedIcon,
    LockOpenIcon,
    ShieldCheckIcon,
    UserIcon,
} from "@heroicons/react/24/outline";
import axios from "axios";
import { Fragment } from "react";

export default function UserOptionsDropdown({ conversation }) {
    const changeUserRole = async () => {
        if (!conversation.is_user) return;

        try {
            const response = await axios.post(
                route("user.changeRole", conversation.id),
            );
            if (import.meta.env.DEV) console.log(response.data);
        } catch (error) {
            console.error("Failed to change user role:", error);
        }
    };

    const onBlockUser = async () => {
        if (!conversation.is_user) return;

        try {
            const response = await axios.post(
                route("user.blockUnblock", conversation.id),
            );
            if (import.meta.env.DEV) console.log(response.data);
        } catch (error) {
            console.error("Failed to block/unblock user:", error);
        }
    };

    return (
        <div className="relative">
            <Menu as="div" className="relative inline-block text-left">
                <Menu.Button
                    className="flex justify-center items-center w-8 h-8 rounded-full text-muted hover:text-main hover:bg-surface-elevated transition-colors"
                    title="Opsi pengguna"
                    aria-label="Opsi pengguna"
                >
                    <EllipsisVerticalIcon className="h-5 w-5" />
                </Menu.Button>
                <Transition
                    as={Fragment}
                    enter="transition ease-out duration-100"
                    enterFrom="transform opacity-0 scale-95"
                    enterTo="transform opacity-100 scale-100"
                    leave="transition ease-in duration-75"
                    leaveFrom="transform opacity-100 scale-100"
                    leaveTo="transform opacity-0 scale-95"
                >
                    <Menu.Items className="absolute right-0 mt-2 w-48 rounded-xl bg-surface border border-border shadow-xl z-50 overflow-hidden origin-top-right focus:outline-hidden p-1 text-main animate-scale-in">
                        <div className="space-y-0.5">
                            <Menu.Item>
                                {({ active }) => (
                                    <button
                                        onClick={onBlockUser}
                                        className={`${
                                            active
                                                ? "bg-surface-elevated text-main"
                                                : "text-main"
                                        } group flex w-full items-center rounded-lg px-3 py-2 text-xs font-medium transition-colors gap-2 text-left`}
                                    >
                                        {conversation.blocked_at ? (
                                            <>
                                                <LockOpenIcon className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                                <span>Buka Blokir Pengguna</span>
                                            </>
                                        ) : (
                                            <>
                                                <LockClosedIcon className="w-4 h-4 text-red-600 dark:text-red-400" />
                                                <span>Blokir Pengguna</span>
                                            </>
                                        )}
                                    </button>
                                )}
                            </Menu.Item>

                            <Menu.Item>
                                {({ active }) => (
                                    <button
                                        onClick={changeUserRole}
                                        className={`${
                                            active
                                                ? "bg-surface-elevated text-main"
                                                : "text-main"
                                        } group flex w-full items-center rounded-lg px-3 py-2 text-xs font-medium transition-colors gap-2 text-left`}
                                    >
                                        {conversation.is_admin ? (
                                            <>
                                                <UserIcon className="w-4 h-4 text-primary" />
                                                <span>Cabut Status Admin</span>
                                            </>
                                        ) : (
                                            <>
                                                <ShieldCheckIcon className="w-4 h-4 text-primary" />
                                                <span>Jadikan Admin</span>
                                            </>
                                        )}
                                    </button>
                                )}
                            </Menu.Item>
                        </div>
                    </Menu.Items>
                </Transition>
            </Menu>
        </div>
    );
}
