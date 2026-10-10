import React, { useState, useEffect, useMemo } from "react";
import Modal from "@/Components/Modal";
import TextInput from "@/Components/TextInput";
import PrimaryButton from "@/Components/PrimaryButton";
import SecondaryButton from "@/Components/SecondaryButton";
import UserAvatar from "./UserAvatar";
import axios from "axios";
import { usePage } from "@inertiajs/react";
import {
    XMarkIcon,
    UserGroupIcon,
    MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";

const CreateGroupModal = ({
    show,
    isOpen,
    onClose,
    onGroupCreated,
    users = null,
}) => {
    const isVisible = Boolean(isOpen ?? show);
    const { auth, conversation } = usePage().props;
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Derive available users from props or page context
    const availableUsers = useMemo(() => {
        if (Array.isArray(users) && users.length > 0) {
            return users.filter((u) => u.id !== auth?.user?.id);
        }
        if (Array.isArray(conversation) && conversation.length > 0) {
            return conversation.filter((c) => c.is_user && c.id !== auth?.user?.id);
        }
        return [];
    }, [users, conversation, auth]);

    useEffect(() => {
        if (!isVisible) {
            setName("");
            setDescription("");
            setSelectedUsers([]);
            setSearchTerm("");
            setError("");
        }
    }, [isVisible]);

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
            setError("Nama grup wajib diisi");
            return;
        }
        if (selectedUsers.length === 0) {
            setError("Pilih minimal satu anggota grup");
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
                if (onGroupCreated) onGroupCreated(response.data.group);
                handleClose();
            }
        } catch (err) {
            setError(err.response?.data?.message || "Gagal membuat grup. Silakan coba lagi.");
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
        user.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <Modal show={isVisible} onClose={handleClose} maxWidth="md">
            <form onSubmit={handleSubmit} className="p-6 bg-surface text-main border border-border rounded-xl">
                <div className="flex items-center justify-between mb-6 pb-3 border-b border-border">
                    <div className="flex items-center gap-2">
                        <UserGroupIcon className="w-5 h-5 text-primary" />
                        <h2 className="text-lg font-display font-bold text-main">
                            Buat Grup Baru
                        </h2>
                    </div>
                    <button
                        type="button"
                        onClick={handleClose}
                        className="min-h-[44px] min-w-[44px] p-2 hover:bg-surface-elevated text-muted hover:text-main rounded-lg transition-colors flex items-center justify-center"
                        aria-label="Tutup dialog buat grup"
                    >
                        <XMarkIcon className="w-5 h-5" />
                    </button>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-600 dark:text-red-400 text-sm">
                        {error}
                    </div>
                )}

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-main mb-1.5">
                            Nama Grup <span className="text-red-500">*</span>
                        </label>
                        <TextInput
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Contoh: Tim Medis Operasional"
                            className="w-full bg-surface-elevated border-border text-main placeholder-muted rounded-lg text-sm focus:border-border-active focus:ring-1 focus:ring-border-active"
                            maxLength={255}
                            autoFocus
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-main mb-1.5">
                            Deskripsi (Opsional)
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Keterangan singkat tujuan grup..."
                            className="w-full bg-surface-elevated border border-border text-main placeholder-muted rounded-lg p-3 text-sm focus:border-border-active focus:ring-1 focus:ring-border-active resize-none outline-none"
                            rows={2}
                        />
                    </div>

                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="block text-sm font-semibold text-main">
                                Pilih Anggota ({selectedUsers.length} dipilih)
                            </label>
                        </div>

                        {selectedUsers.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mb-3">
                                {selectedUsers.map((user) => (
                                    <div
                                        key={user.id}
                                        className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-primary/10 border border-primary/20 rounded-full text-xs font-medium text-main"
                                    >
                                        <span className="truncate max-w-[120px]">{user.name}</span>
                                        <button
                                            type="button"
                                            onClick={() => toggleUser(user)}
                                            className="min-h-[24px] min-w-[24px] flex items-center justify-center text-muted hover:text-red-500 rounded-full"
                                            aria-label={`Hapus ${user.name}`}
                                        >
                                            <XMarkIcon className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="relative mb-2 flex items-center">
                            <MagnifyingGlassIcon className="absolute left-3 w-4 h-4 text-muted pointer-events-none" />
                            <TextInput
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Cari kontak anggota..."
                                className="w-full pl-9 py-2 bg-surface-elevated border-border text-main placeholder-muted rounded-lg text-sm focus:border-border-active focus:ring-1 focus:ring-border-active"
                            />
                        </div>

                        <div className="max-h-48 overflow-y-auto custom-scrollbar space-y-1 rounded-lg bg-surface-elevated border border-border p-2">
                            {filteredUsers.length === 0 ? (
                                <p className="text-center text-muted text-xs py-5">
                                    Tidak ada kontak ditemukan
                                </p>
                            ) : (
                                filteredUsers.map((user) => {
                                    const isSelected = Boolean(selectedUsers.find((u) => u.id === user.id));
                                    return (
                                        <button
                                            key={user.id}
                                            type="button"
                                            onClick={() => toggleUser(user)}
                                            className={`w-full min-h-[44px] flex items-center gap-3 p-2 rounded-lg transition-colors text-left ${
                                                isSelected
                                                    ? "bg-primary/10 border border-primary/40 text-main font-medium"
                                                    : "hover:bg-surface border border-transparent text-muted hover:text-main"
                                            }`}
                                        >
                                            <UserAvatar user={user} className="w-8 h-8" />
                                            <span className="text-sm truncate flex-1">{user.name}</span>
                                            {isSelected && (
                                                <span className="text-xs font-semibold text-primary px-2">
                                                    ✓
                                                </span>
                                            )}
                                        </button>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-3 mt-6 pt-3 border-t border-border">
                    <SecondaryButton type="button" onClick={handleClose} className="min-h-[44px]">
                        Batal
                    </SecondaryButton>
                    <PrimaryButton type="submit" disabled={loading} className="min-h-[44px]">
                        {loading ? "Menyimpan..." : "Buat Grup"}
                    </PrimaryButton>
                </div>
            </form>
        </Modal>
    );
};

export default CreateGroupModal;
