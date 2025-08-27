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
                route("user.changeRole", conversation.id)
            );
            console.log(response.data);
        } catch (error) {
            console.error("Failed to change user role:", error);
        }
    };

    const onBlockUser = async () => {
        if (!conversation.is_user) return;

        try {
            const response = await axios.post(
                route("user.blockUnblock", conversation.id)
            );
            console.log(response.data);
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
                    <Menu.Items className="absolute right-0 mt-2 w-48 rounded-md bg-gray-800 shadow-lg z-50 ring-1 ring-black ring-opacity-5 focus:outline-none">
                        <div className="px-1 py-1">
                            <Menu.Item>
                                {({ active }) => (
                                    <button
                                        onClick={onBlockUser}
                                        className={`${
                                            active ? "bg-gray-700" : ""
                                        } group flex w-full items-center rounded-md px-2 py-2 text-sm text-gray-100 hover:bg-gray-700 transition-colors`}
                                    >
                                        {conversation.blocked_at ? (
                                            <>
                                                <LockOpenIcon className="w-4 h-4 mr-2" />
                                                Unblock User
                                            </>
                                        ) : (
                                            <>
                                                <LockClosedIcon className="w-4 h-4 mr-2" />
                                                Block User
                                            </>
                                        )}
                                    </button>
                                )}
                            </Menu.Item>
                        </div>
                        <div className="px-1 py-1">
                            <Menu.Item>
                                {({ active }) => (
                                    <button
                                        onClick={changeUserRole}
                                        className={`${
                                            active ? "bg-gray-700" : ""
                                        } group flex w-full items-center rounded-md px-2 py-2 text-sm text-gray-100 hover:bg-gray-700 transition-colors`}
                                    >
                                        {conversation.is_admin ? (
                                            <>
                                                <UserIcon className="w-4 h-4 mr-2" />
                                                Revoke Admin
                                            </>
                                        ) : (
                                            <>
                                                <ShieldCheckIcon className="w-4 h-4 mr-2" />
                                                Make Admin
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
