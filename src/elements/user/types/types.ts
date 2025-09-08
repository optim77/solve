export interface Purchase {
    id: string;
    created_at: string;
    checkout_session_id: string;
    credits: Credits;
    plans: Plan;
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
    description?: string;
    price: number;
}

export interface Subscription {
    id: string;
    created_at: string;
    months: string;
    active: boolean;
    plans: Plan;
}

export interface UserSubscription {
    id: string;
    name: string;
    price: number;
    description: string;
}
