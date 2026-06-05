import {CreditCard} from "lucide-react";

const CreditsDisplay = ({credits}) => {
    return (
        <div className="flex items-center gap-1.5 bg-terracotta-soft px-3 py-1.5 rounded-full text-terracotta-dark border border-terracotta/20 hover:bg-terracotta/15 transition-colors">
            <CreditCard size={16}/>
            <span className="font-semibold">{credits}</span>
            <span className="text-xs">Credits</span>
        </div>
    )
}

export default CreditsDisplay;