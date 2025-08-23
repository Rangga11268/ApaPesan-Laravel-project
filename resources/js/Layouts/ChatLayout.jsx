import { usePage } from "@inertiajs/react";
import AuthenticatedLayout from "./AuthenticatedLayout";

const ChatLayout = ({ children }) => {
    const page = usePage();
    const coversation = page.props.coversation;
    const selectedConversation = page.props.selectedConversation;
    console.log("conversation", coversation);
    console.log("selectedConversation", selectedConversation);
    return (
        <AuthenticatedLayout>
            Chatlayout
            <div>{children}</div>
        </AuthenticatedLayout>
    );
};

export default ChatLayout;
