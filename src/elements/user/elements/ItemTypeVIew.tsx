import { Plan } from "@/elements/user/hooks/usePlans";
import { Credits } from "@/elements/user/hooks/useCredits";

interface Props {
    type: "subscription" | "credits";
    plans: Plan[] | null | undefined;
    credits?: Plan[] | null | undefined;
}
export const ItemTypeVIew = ({
    type,
    plans,
    credits
}: Props) => {




}