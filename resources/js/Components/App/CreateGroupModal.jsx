import React, { useState, useEffect } from "react";
import Modal from "@/Components/Modal";
import TextInput from "@/Components/TextInput";
import PrimaryButton from "@/Components/PrimaryButton";
import SecondaryButton from "@/Components/SecondaryButton";
import UserAvatar from "./UserAvatar";
import axios from "axios";
import { usePage } from "@inertiajs/react";
import {
    XMarkIcon,
    UserPlusIcon,
    MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";

const CreateGroupModal = ({ show, onClose, onGroupCreated }) => {
    const { auth } = usePage().props;
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [availableUsers, setAvailableUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (show) {
            // Fetch available users
            fetchUsers();
        }
    }, [show]);

    const fetchUsers = async () => {
        try {
            // Get all users except current user
            const response = await axios.get(route("dashboard"));
            // Extract users from conversation data
            const users =
                response.data.props?.conversation?.filter(
                    (c) => c.is_user && c.id !== auth.user.id
                ) || [];
            setAvailableUsers(users);
        } catch (err) {
            console.error("Failed to fetch users:", err);
        }
    };

    const toggleUser = (user) => {
        setSelectedUsers((prev) => {
            const exists = prev.find((u) => u.id === user.id);
            if (exists) {
                return prev.filter((u) => u.id !== user.id);
            }
            return [...prev, user];
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name.trim()) {
            setError("Group name is required");
            return;
        }
        if (selectedUsers.length === 0) {
            setError("Please select at least one member");
            return;
        }

        setLoading(true);
        setError("");

        try {
            const response = await axios.post(route("group.store"), {
                name: name.trim(),
                description: description.trim(),
                user_ids: selectedUsers.map((u) => u.id),
            });

            if (response.data.success) {
                onGroupCreated && onGroupCreated(response.data.group);
                handleClose();
            }
        } catch (err) {
            setError(err.response?.data?.message || "Failed to create group");
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setName("");
        setDescription("");
        setSelectedUsers([]);
        setSearchTerm("");
        setError("");
        onClose();
    };

    const filteredUsers = availableUsers.filter((user) =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <Modal show={show} onClose={handleClose} maxWidth="md">
            <form onSubmit={handleSubmit} className="p-6 bg-surface text-white">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-display font-bold">
                        Create New Group
                    </h2>
                    <button
                        type="button"
                        onClick={handleClose}
                        className="p-1 hover:bg-white/10 rounded-full"
                    >
                        <XMarkIcon className="w-5 h-5" />
                    </button>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300 text-sm">
                        {error}
                    </div>
                )}

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                            Group Name *
                        </label>
                        <TextInput
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Enter group name"
                            className="w-full bg-black/20 border-white/10"
                            maxLength={255}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                            Description (optional)
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="What's this group about?"
                            className="w-full bg-black/20 border-white/10 rounded-lg p-3 text-white placeholder-gray-500 resize-none"
                            rows={2}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Add Members ({selectedUsers.length} selected)
                        </label>

                        {/* Selected users */}
                        {selectedUsers.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-3">
                                {selectedUsers.map((user) => (
                                    <div
                                        key={user.id}
                                        className="flex items-center gap-1 px-2 py-1 bg-primary-500/20 rounded-full text-sm"
                                    >
                                        <span>{user.name}</span>
                                        <button
                                            type="button"
                                            onClick={() => toggleUser(user)}
                                            className="hover:text-red-400"
                                        >
                                            <XMarkIcon className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Search */}
                        <div className="relative mb-2">
                            <MagnifyingGlassIcon className="absolute left-3 top-2.5 w-5 h-5 text-gray-500" />
                            <TextInput
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search users..."
                                className="w-full pl-10 bg-black/20 border-white/10"
                            />
                        </div>

                        {/* User list */}
                        <div className="max-h-48 overflow-y-auto space-y-1 rounded-lg bg-black/20 p-2">
                            {filteredUsers.length === 0 ? (
                                <p className="text-center text-gray-500 py-4">
                                    No users found
                                </p>
                            ) : (
                                filteredUsers.map((user) => (
                                    <button
                                        key={user.id}
                                        type="button"
                                        onClick={() => toggleUser(user)}
                                        className={`
                                            w-full flex items-center gap-3 p-2 rounded-lg transition-colors
                                            ${
                                                selectedUsers.find(
                                                    (u) => u.id === user.id
                                                )
                                                    ? "bg-primary-500/20 border border-primary-500/50"
                                                    : "hover:bg-white/5"
                                            }
                                        `}
                                    >
                                        <UserAvatar
                                            user={user}
                                            className="w-8 h-8"
                                        />
                                        <span className="text-sm">
                                            {user.name}
                                        </span>
                                    </button>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                    <SecondaryButton type="button" onClick={handleClose}>
                        Cancel
                    </SecondaryButton>
                    <PrimaryButton type="submit" disabled={loading}>
                        {loading ? "Creating..." : "Create Group"}
                    </PrimaryButton>
                </div>
            </form>
        </Modal>
    );
};

export default CreateGroupModal;
