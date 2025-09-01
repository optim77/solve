"use client";

import { createPortal } from "react-dom";
import { useUserBar } from "@/elements/user/hooks/useUserBar";
import { usePlans } from "@/elements/user/hooks/usePlans";
import { useState } from "react";
import { useCredits } from "@/elements/user/hooks/useCredits";
import { usePayment } from "@/elements/user/hooks/usePayment";


type Item = "subscription" | "credits";

export default function UserBar() {
    const { profile, loading, setShowSettings, showSettings, setShowPlans, showPlans } = useUserBar();
    const { plans, loadingPlan } = usePlans();
    const { credits, loadingCredits } = useCredits();
    const { handleCheckout } = usePayment();
    const [item, setItem] = useState<Item>("subscription");

    if (loading) {
        return (
            <div className="flex justify-center items-center h-full">
                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="sticky bottom-0 border-t pt-3 mt-3 flex items-center justify-center text-sm text-gray-400">
                Not logged in
            </div>
        );
    }

    return (
        <>
            <div className="sticky bottom-0 border-t pt-3 mt-3 flex items-center justify-between text-sm text-gray-700">
                <span
                    className="font-medium text-white cursor-pointer hover:underline"
                    onClick={() => setShowSettings(true)}
                >
                    {profile.name}
                </span>
                <span
                    className="text-blue-600 font-bold cursor-pointer hover:underline"
                    onClick={() => setShowPlans(true)}
                >
                    {profile.credits} credits
                </span>
            </div>

            {showSettings && createPortal(
                <div
                    className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-[9999]"
                    onClick={() => setShowSettings(false)}
                >
                    <div
                        className=" border-3 rounded-2xl shadow-lg w-96 p-6 relative"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h2 className="text-lg font-semibold mb-4">Ustawienia</h2>
                        <p>Tu w przyszłości możesz dać np. zmianę hasła, avatar itp.</p>
                        <button
                            onClick={() => setShowSettings(false)}
                            className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 cursor-pointer"
                        >
                            ✕
                        </button>
                    </div>
                </div>,
                document.body
            )}

            {showPlans && createPortal(
                <div
                    className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-[9999]"
                    onClick={() => setShowPlans(false)}
                >
                    <div
                        className=" border-3 rounded-2xl shadow-lg w-300 p-6 relative"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h1 className="text-3xl font-semibold mb-4 text-center">Manage your Solve purchase</h1>
                        <p className=" font-semibold mb-4 text-center">Select the plan or credits that best fits your
                            needs</p>
                        <div className="flex justify-center mb-5">
                            <div className="flex items-center me-4">
                                <input id="inline-radio"
                                       type="radio"
                                       value=""
                                       name="inline-radio-group"
                                       checked={item == "subscription"}
                                       onClick={() => {
                                           setItem("subscription")
                                       }}
                                       className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"/>
                                <label htmlFor="inline-radio"
                                       className="ms-2 text-sm font-medium text-gray-900 dark:text-gray-300">Subscription</label>
                            </div>
                            <div className="flex items-center me-4">
                                <input id="inline-2-radio"
                                       type="radio"
                                       value=""
                                       name="inline-radio-group"
                                       checked={item == "credits"}
                                       onClick={() => {
                                           setItem("credits")
                                       }}
                                       className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"/>
                                <label htmlFor="inline-2-radio"
                                       className="ms-2 text-sm font-medium text-gray-900 dark:text-gray-300">Credit</label>
                            </div>
                        </div>
                        {item === "subscription" && (
                            <>

                                <div className="flex justify-center mb-5">
                                    {!loadingPlan && (
                                        plans.map(plan => (
                                            <div key={plan.id} className="p-4 border rounded-lg mb-2 m-5 text-center">
                                                <h3 className="text-lg font-semibold">{plan.name}</h3>
                                                <span className="text-blue-500 font-bold ">${plan.price}/month</span>
                                                <br/>
                                                <button
                                                    onClick={() => handleCheckout(plan.id, "subscription")}
                                                    className="cursor-pointer mt-5 text-gray-900 bg-gradient-to-r
                                                    from-teal-200 to-lime-200 hover:bg-gradient-to-l hover:from-teal-200
                                                    hover:to-lime-200 focus:ring-4 focus:outline-none focus:ring-lime-200
                                                    dark:focus:ring-teal-700 font-medium rounded-lg text-sm px-5 py-2.5
                                                    text-center me-2 mb-2">
                                                    Subscribe
                                                </button>
                                                <div
                                                    className="text-sm mt-5"
                                                    dangerouslySetInnerHTML={{__html: plan.description}}
                                                />
                                            </div>
                                        ))
                                    )}
                                </div>
                            </>
                        )}


                        {item === "credits" && (
                            <div className="flex justify-center mb-5">
                                {!loadingCredits && (
                                    credits.map(credit => (
                                        <div key={credit.id} className="p-4 border rounded-lg mb-2 m-5 text-center">
                                            <h3 className="text-blue-500 font-bold ">{credit.credits} credits</h3>
                                            <br/>
                                            <button
                                                onClick={() => handleCheckout(credit.id, "credit")}
                                                className="cursor-pointer mt-5 text-gray-900 bg-gradient-to-r
                                                from-teal-200 to-lime-200 hover:bg-gradient-to-l hover:from-teal-200
                                                hover:to-lime-200 focus:ring-4 focus:outline-none focus:ring-lime-200
                                                dark:focus:ring-teal-700 font-medium rounded-lg text-sm px-5 py-2.5
                                                text-center me-2 mb-2">
                                                Purchase
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}


                        <button
                            onClick={() => setShowPlans(false)}
                            className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 cursor-pointer"
                        >
                            ✕
                        </button>
                    </div>
                </div>,
                document.body
            )}
        </>
    );
}
