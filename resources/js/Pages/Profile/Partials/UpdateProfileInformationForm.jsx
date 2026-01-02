import InputError from "@/Components/InputError";
import InputLabel from "@/Components/InputLabel";
import PrimaryButton from "@/Components/PrimaryButton";
import TextInput from "@/Components/TextInput";
import { Transition } from "@headlessui/react";
import { Link, useForm, usePage } from "@inertiajs/react";

import { CameraIcon, UserCircleIcon } from "@heroicons/react/24/outline";
import { useRef, useState } from "react";

export default function UpdateProfileInformation({
    mustVerifyEmail,
    status,
    className = "",
}) {
    const user = usePage().props.auth.user;
    const photoRef = useRef(null);
    const [photoPreview, setPhotoPreview] = useState(null);

    const { data, setData, post, errors, processing, recentlySuccessful } =
        useForm({
            name: user.name,
            email: user.email,
            avatar: null,
            _method: "PATCH", // Helper for Laravel file uploads on PATCH
        });

    const submit = (e) => {
        e.preventDefault();
        post(route("profile.update"));
    };

    const updatePhotoPreview = () => {
        const photo = photoRef.current.files[0];
        if (!photo) return;

        setData("avatar", photo);

        const reader = new FileReader();
        reader.onload = (e) => {
            setPhotoPreview(e.target.result);
        };
        reader.readAsDataURL(photo);
    };

    const selectNewPhoto = () => {
        photoRef.current.click();
    };

    return (
        <section className={className}>
            <header className="flex flex-col items-center mb-8">
                {/* Avatar Input */}
                <input
                    type="file"
                    className="hidden"
                    ref={photoRef}
                    onChange={updatePhotoPreview}
                />

                <div
                    className="relative w-32 h-32 mb-4 group cursor-pointer"
                    onClick={selectNewPhoto}
                    style={{ width: "128px", height: "128px" }}
                >
                    {photoPreview ? (
                        <div
                            className="block rounded-full w-32 h-32 bg-cover bg-no-repeat bg-center border-4 border-white/10 shadow-[0_0_20px_rgba(124,58,237,0.3)] transition-all group-hover:border-primary-500"
                            style={{
                                backgroundImage: `url('${photoPreview}')`,
                                width: "8em",
                                height: "8rem",
                            }}
                        />
                    ) : (
                        <div className="w-full h-full rounded-full border-4 border-white/10 overflow-hidden shadow-[0_0_20px_rgba(124,58,237,0.3)] bg-black/40 flex items-center justify-center transition-all group-hover:border-primary-500">
                            {user.avatar_url ? (
                                <img
                                    src={user.avatar_url}
                                    alt={user.name}
                                    className="w-full h-full object-cover"
                                    style={{ width: "100%", height: "100%" }}
                                />
                            ) : (
                                <UserCircleIcon className="w-full h-full text-gray-500 p-4" />
                            )}
                        </div>
                    )}

                    {/* Camera Overlay */}
                    <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <CameraIcon className="w-10 h-10 text-white" />
                    </div>

                    {/* Add Icon Badge */}
                    <div className="absolute bottom-1 right-1 bg-primary-600 rounded-full p-2 border-4 border-[#0F1115]">
                        <CameraIcon className="w-4 h-4 text-white" />
                    </div>
                </div>

                <h2 className="text-xl font-display font-bold text-white">
                    {user.name}
                </h2>
                <p className="text-sm text-gray-400">{user.email}</p>
            </header>

            <form onSubmit={submit} className="space-y-6">
                <div>
                    <InputLabel
                        htmlFor="name"
                        value="Name"
                        className="text-gray-300"
                    />

                    <TextInput
                        id="name"
                        className="mt-1 block w-full bg-black/20 border-white/10 text-white focus:border-primary-500 focus:ring-primary-500"
                        value={data.name}
                        onChange={(e) => setData("name", e.target.value)}
                        required
                        isFocused
                        autoComplete="name"
                    />

                    <InputError className="mt-2" message={errors.name} />
                </div>

                <div>
                    <InputLabel
                        htmlFor="email"
                        value="Email"
                        className="text-gray-300"
                    />

                    <TextInput
                        id="email"
                        type="email"
                        className="mt-1 block w-full bg-black/20 border-white/10 text-white focus:border-primary-500 focus:ring-primary-500"
                        value={data.email}
                        onChange={(e) => setData("email", e.target.value)}
                        required
                        autoComplete="username"
                    />

                    <InputError className="mt-2" message={errors.email} />
                </div>

                {mustVerifyEmail && user.email_verified_at === null && (
                    <div>
                        <p className="mt-2 text-sm text-gray-200">
                            Your email address is unverified.
                            <Link
                                href={route("verification.send")}
                                method="post"
                                as="button"
                                className="rounded-md text-sm text-gray-400 underline hover:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
                            >
                                Click here to re-send the verification email.
                            </Link>
                        </p>

                        {status === "verification-link-sent" && (
                            <div className="mt-2 text-sm font-medium text-emerald-400">
                                A new verification link has been sent to your
                                email address.
                            </div>
                        )}
                    </div>
                )}

                <div className="flex items-center gap-4">
                    <PrimaryButton
                        disabled={processing}
                        className="bg-primary-600 hover:bg-primary-500 border-none glow-button"
                    >
                        Save Changes
                    </PrimaryButton>

                    <Transition
                        show={recentlySuccessful}
                        enter="transition ease-in-out"
                        enterFrom="opacity-0"
                        leave="transition ease-in-out"
                        leaveTo="opacity-0"
                    >
                        <p className="text-sm text-emerald-400 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>{" "}
                            Saved.
                        </p>
                    </Transition>
                </div>
            </form>
        </section>
    );
}
