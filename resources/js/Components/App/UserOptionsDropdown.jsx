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
                <Menu.Button className="flex justify-center items-center w-8 h-8 rounded-full hover:bg-gray-700 transition-colors">
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
                    <Menu.Items className="absolute right-0 mt-2 w-48 rounded-xl bg-[#0f1218]/95 backdrop-blur-xl border border-white/10 shadow-lg shadow-black/50 z-50 overflow-hidden origin-top-right ring-1 ring-white/5 focus:outline-none">
                        <div className="p-1">
                            <Menu.Item>
                                {({ active }) => (
                                    <button
                                        onClick={onBlockUser}
                                        className={`${
                                            active
                                                ? "bg-white/10 text-primary-300"
                                                : "text-gray-300"
                                        } group flex w-full items-center rounded-lg px-3 py-2 text-xs font-medium transition-all gap-2`}
                                    >
                                        {conversation.blocked_at ? (
                                            <>
                                                <LockOpenIcon className="w-4 h-4 text-emerald-400" />
                                                <span>Unblock User</span>
                                            </>
                                        ) : (
                                            <>
                                                <LockClosedIcon className="w-4 h-4 text-red-400" />
                                                <span>Block User</span>
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
                                                ? "bg-white/10 text-primary-300"
                                                : "text-gray-300"
                                        } group flex w-full items-center rounded-lg px-3 py-2 text-xs font-medium transition-all gap-2`}
                                    >
                                        {conversation.is_admin ? (
                                            <>
                                                <UserIcon className="w-4 h-4 text-blue-400" />
                                                <span>Revoke Admin</span>
                                            </>
                                        ) : (
                                            <>
                                                <ShieldCheckIcon className="w-4 h-4 text-primary-400" />
                                                <span>Make Admin</span>
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
