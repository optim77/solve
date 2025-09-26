"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function SuccessContent() {
    const searchParams = useSearchParams();
    const sessionId = searchParams.get("session_id");

    return (
        <div className="flex flex-col items-center justify-center min-h-screen text-center p-10">
            <h1 className="text-3xl font-bold text-green-600 mb-4">
                Payment Successful! 🎉
            </h1>
            <p className="text-lg text-white">
                Your payment was successful. You can now start using the app.
                <br />
                <span>Your payment ID is:</span>
                <p>{sessionId}</p>
                <br />
                <br />
                <Link
                    className="cursor-pointer mt-5 text-gray-900 bg-gradient-to-r
                     from-teal-200 to-lime-200 hover:bg-gradient-to-l hover:from-teal-200
                     hover:to-lime-200 focus:ring-4 focus:outline-none focus:ring-lime-200
                     dark:focus:ring-teal-700 font-medium rounded-lg text-sm px-5 py-2.5
                     text-center me-2 mb-2"
                    href="/protected/chat"
                >
                    Return to chat
                </Link>
            </p>
        </div>
    );
}

export default function SuccessPage() {
    return (
        <Suspense fallback={<div className="p-10 text-center">Loading...</div>}>
            <SuccessContent />
        </Suspense>
    );
}
