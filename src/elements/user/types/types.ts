export interface Purchase {
    checkout_session_id: string;
    created_at: string;
    name: string;
    type: string;
}

interface Subscription {
    created_at: string;
    plan: Plan;
}

export interface Credits {
    id: string;
    credits: number;
    price: number;
}

export type Item = "subscription" | "credits";

export interface Plan {
    id: string;
    name: string;
    description: string;
    price: number;
}

export interface Subscription {
    created_at: string;
    plan: Plan;
}