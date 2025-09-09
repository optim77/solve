import ChatPage from "@/components/ChatPage";
import { createClient } from "@/lib/superbase/server";
import { redirect } from "next/navigation";
import { ChatProvider } from "@/components/context/ChatProvider";
import { UserBarProvider } from "@/elements/user/UserBarContext";

export default async function Chat() {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.getUser();

    if (error || !data?.user) {
        redirect("/auth/login");
    }

    return (
        <UserBarProvider>
            <ChatProvider>
                <ChatPage />
            </ChatProvider>
        </UserBarProvider>
    );
}
