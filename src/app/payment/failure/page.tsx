import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function SuccessPage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen text-center p-10">
            <h1 className="text-3xl font-bold text-green-600 mb-4">Payment Failed!</h1>
            <p className="text-lg text-gray-700">
                Something went wrong. Please try again later.
                <br/>
                <br/>
                <Link href="/protected/chat">
                    <Button>
                        Go to main
                    </Button>
                </Link>
            </p>
        </div>
    );
}
