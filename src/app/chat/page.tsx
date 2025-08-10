import { SignedIn, SignedOut, SignIn } from "@clerk/nextjs";
import ChatPage from "@/components/ChatPage";
import Navbar from "@/components/Navbar";

export default function Chat() {
    return (
        <>

            <SignedIn>
                <Navbar />
                <ChatPage />
            </SignedIn>
            <SignedOut>
                <SignIn />
            </SignedOut>
        </>
    );
}
