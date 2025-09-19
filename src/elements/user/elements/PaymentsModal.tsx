import { createPortal } from "react-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Purchase, UserSubscription } from "@/elements/user/types/types";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";


interface PaymentsModalProps {
    show: boolean;
    onClose: () => void;
    subscriptions?: UserSubscription | null;
    payments: Purchase[];
    loadingPayment: boolean;
    loadingSubscription: boolean;
}

export const PaymentsModal = ({
                                  show,
                                  onClose,
                                  subscriptions,
                                  payments,
                                  loadingSubscription,
                                  loadingPayment
                              }: PaymentsModalProps) => {

    if (!show) return null;

    return createPortal(
        <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-[9999]"
        >
            <div
                className="border-3 rounded-2xl shadow-lg w-300 p-6 relative"
                onClick={(e) => e.stopPropagation()}
            >
                <h1 className="text-3xl font-semibold mb-4 text-center">
                    Your purchase history
                </h1>

                <Tabs defaultValue="subscriptions" className="text-center">
                    <TabsList>
                        <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
                        <TabsTrigger value="payments">Payments</TabsTrigger>
                    </TabsList>
                    <TabsContent value="subscriptions">
                        <h3 className="text-sm mt-5">Your active subscription plan</h3>
                        {!loadingSubscription && subscriptions && (


                            <div
                                key={subscriptions.id}
                                className="p-4 border rounded-lg mb-2 m-5  items-center"
                            >
                                <h3 className="text-lg font-semibold">{subscriptions.name}</h3>
                                <span className="text-blue-500 font-bold">${subscriptions.price}/month</span>
                                <br/>
                                <div>
                                    <div
                                        className="text-sm mt-5 text-center w-full block"
                                        dangerouslySetInnerHTML={{__html: subscriptions.description!}}
                                    />
                                </div>

                                <button
                                    className="cursor-pointer bg-red-500 rounded-lg text-sm px-5 py-2.5 ml-3 text-center"
                                    onClick={async () => {
                                        await fetch("/api/stripe/unsubscribe", {
                                            method: "POST",
                                        });
                                        window.location.reload();
                                    }}
                                >
                                    Unsubscribe
                                </button>
                            </div>
                        )}

                    </TabsContent>

                    <TabsContent value="payments">
                        <div className="max-h-[400px] overflow-y-auto pr-2 space-y-4 mt-10">
                            {!loadingPayment &&
                                payments.map((payment) => (
                                    <Card key={payment.id} className="rounded-2xl shadow-sm p-4 border">
                                        <CardContent className="space-y-3">
                                            <div className="flex justify-between items-center">
                                                <p className="text-sm text-muted-foreground">
                                                    {new Date(payment.created_at).toLocaleDateString()}
                                                </p>
                                                <span className="text-xs font-mono text-muted-foreground">
                                                    {payment.checkout_session_id}
                                                </span>
                                            </div>

                                            {payment.credits && (
                                                <div className="border-t pt-3">
                                                    <p className="text-sm font-semibold mb-1">Credits</p>
                                                    <div className="flex justify-between text-sm">
                                                        <span>{payment.credits.credits} credits</span>
                                                        <span className="font-medium">{payment.credits.price} $</span>
                                                    </div>
                                                </div>
                                            )}

                                            {payment.plans && (
                                                <div className="border-t pt-3">
                                                    <p className="text-sm font-semibold mb-1">Subscription</p>
                                                    <div className="flex justify-between text-sm">
                                                        <span>{payment.plans.name}</span>
                                                        <span className="font-medium">{payment.plans.price} $</span>
                                                    </div>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                ))}
                        </div>
                    </TabsContent>
                </Tabs>

                <button
                    onClick={onClose}
                    className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 cursor-pointer"
                >
                    ✕
                </button>
            </div>
        </div>,
        document.body,
    )

}