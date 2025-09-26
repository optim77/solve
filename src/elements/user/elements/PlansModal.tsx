import { createPortal } from "react-dom";

import { Credits, Item, Plan } from "@/elements/user/types/types";
import { UserPlan } from "@/elements/user/hooks/useUserBar";
import { useSupabaseUser } from "@/components/superbase/SupabaseUserProvider";


interface PlansModalProps {
    show: boolean;
    onClose: () => void;
    item: Item;
    setItem: (item: Item) => void;
    plans: Plan[];
    credits: Credits[];
    loadingPlans: boolean;
    loadingCredits: boolean;
    handleCheckout: (id: string, type: Item) => void;
    buyCredits: (packId: string, userId: string) => void;
    userPlan: UserPlan[] | UserPlan | null;
    activeSub: boolean;
    handleManageSubscription: () => void;
}

export default function PlansModal({
                                       show,
                                       onClose,
                                       item,
                                       setItem,
                                       plans,
                                       credits,
                                       loadingPlans,
                                       loadingCredits,
                                       handleCheckout,
                                       buyCredits,
                                       userPlan,
                                       activeSub,
                                       handleManageSubscription
                                   }: PlansModalProps) {
    const {user} = useSupabaseUser();
    if (!show) return null;
    return createPortal(
        <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-[9999]"
            onClick={onClose}
        >
            <div
                className="border-3 rounded-2xl shadow-lg w-300 p-6 relative"
                onClick={(e) => e.stopPropagation()}
            >
                <h1 className="text-3xl font-semibold mb-4 text-center">
                    Manage your Solve purchase
                </h1>
                <p className="font-semibold mb-4 text-center">
                    Select the plan or credits that best fits your needs
                </p>
                {/*// TODO: Change from select buttons to shadcn tabs*/}
                <div className="flex justify-center mb-5">
                    <div className="flex items-center me-4">
                        <input
                            id="inline-radio"
                            type="radio"
                            name="inline-radio-group"
                            checked={item === "subscription"}
                            onChange={() => setItem("subscription")}
                            className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                        />
                        <label
                            htmlFor="inline-radio"
                            className="ms-2 text-sm font-medium text-white"
                        >
                            Subscription
                        </label>
                    </div>
                    <div className="flex items-center me-4">
                        <input
                            id="inline-2-radio"
                            type="radio"
                            name="inline-radio-group"
                            checked={item === "credits"}
                            onChange={() => setItem("credits")}
                            className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                        />
                        <label
                            htmlFor="inline-2-radio"
                            className="ms-2 text-sm font-medium text-white"
                        >
                            Credits
                        </label>
                    </div>
                </div>

                {item === "subscription" && (
                    <div className="flex justify-center mb-5 flex-wrap">
                        {!loadingPlans &&
                            plans.map((plan) => (
                                <div
                                    key={plan.id}
                                    className="p-4 border rounded-lg mb-2 m-5 text-center"
                                >
                                    <h3 className="text-lg font-semibold">{plan.name}</h3>
                                    <span className="text-blue-500 font-bold">
                                        ${plan.price}/month
                                      </span>
                                    <br/>
                                    {
                                        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                                        // @ts-expect-error
                                        activeSub && userPlan?.name === plan.name ? (

                                        <p className="p-4 ">Your plan</p>
                                    ) : (
                                        <>
                                            {!userPlan && !activeSub ? (
                                                <button
                                                    onClick={() => handleCheckout(plan.id, "subscription")}
                                                    className="cursor-pointer mt-5 text-gray-900 bg-gradient-to-r from-teal-200
                                            to-lime-200 hover:bg-gradient-to-l hover:from-teal-200 hover:to-lime-200
                                            focus:ring-4 focus:outline-none focus:ring-lime-200 font-medium rounded-lg
                                            text-sm px-5 py-2.5 text-center"
                                                >
                                                    Subscribe
                                                </button>

                                            ) : (
                                                <button
                                                    onClick={() => handleManageSubscription()}
                                                    className="cursor-pointer mt-5 text-gray-900 bg-gradient-to-r from-teal-200
                                            to-lime-200 hover:bg-gradient-to-l hover:from-teal-200 hover:to-lime-200
                                            focus:ring-4 focus:outline-none focus:ring-lime-200 font-medium rounded-lg
                                            text-sm px-5 py-2.5 text-center"
                                                >
                                                    Change plan
                                                </button>
                                            )}

                                        </>

                                    )}

                                    <div
                                        className="text-sm mt-5"
                                        dangerouslySetInnerHTML={{__html: plan.description!}}
                                    />
                                </div>
                            ))}
                    </div>
                )}

                {item === "credits" && (
                    <div className="flex justify-center mb-5 flex-wrap">
                        {!loadingCredits &&
                            credits.map((credit) => (
                                <div
                                    key={credit.id}
                                    className="p-4 border rounded-lg mb-2 m-5 text-center"
                                >
                                    <h3 className="text-blue-500 font-bold">
                                        {credit.credits} credits
                                    </h3>
                                    <br/>
                                    <button
                                        onClick={() => {
                                            if (user) {
                                                buyCredits(credit.id, user.id)
                                            }
                                        }}
                                        className="cursor-pointer mt-5 text-gray-900 bg-gradient-to-r from-teal-200
                                        to-lime-200 hover:bg-gradient-to-l hover:from-teal-200 hover:to-lime-200
                                        focus:ring-4 focus:outline-none focus:ring-lime-200 font-medium rounded-lg
                                        text-sm px-5 py-2.5 text-center"
                                    >
                                        Purchase
                                    </button>
                                </div>
                            ))}
                    </div>
                )}

                <button
                    onClick={onClose}
                    className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 cursor-pointer"
                >
                    ✕
                </button>
            </div>
        </div>,
        document.body
    );
}
