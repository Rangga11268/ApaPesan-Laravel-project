import { UserIcon } from "@heroicons/react/24/outline";

const GroupAvatar = () => {
    return (
        <div className="relative">
            <div className="flex items-center justify-center bg-gray-400 text-gray-800 rounded-full w-8 h-8">
                <UserIcon className="w-4 h-4" />
            </div>
        </div>
    );
};

export default GroupAvatar;
