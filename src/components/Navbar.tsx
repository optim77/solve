
import { SignInButtonStyled } from "@/components/Elements";

export default function Navbar() {
    return (
        <nav className="flex fixed left-0 bottom-20 p-4 bg-opacity-10 backdrop-blur-md">
            <div></div>
            <div>
                <SignInButtonStyled />
            </div>
        </nav>
    );
}
