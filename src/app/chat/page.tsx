import { SignedIn, SignedOut, SignIn } from "@clerk/nextjs";
import ChatPage from "@/components/ChatPage";

export default function Chat() {
    return (
        <>
            <SignedIn>
                <ChatPage />
            </SignedIn>
            <SignedOut>
                <SignIn path={"/sign-in"} />
            </SignedOut>
        </>
    );
}
