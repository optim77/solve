import { UserButton, SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import { SignInButtonStyled } from "@/components/Elements";

export default function Navbar() {
    return (
        <nav className="flex justify-between items-center p-4 bg-opacity-10 backdrop-blur-md">
            <div></div>
            <div>
                <SignedIn>
                    <UserButton afterSignOutUrl="/" />
                </SignedIn>
                <SignedOut>
                    <SignInButton mode={"modal"}>
                        <SignInButtonStyled />
                    </SignInButton>
                </SignedOut>
            </div>
        </nav>
    );
}
