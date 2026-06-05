import {Check} from "lucide-react";
import {SignUpButton} from "@clerk/react";

const PricingSection = ({pricingPlans}) => {
    return (
        <div className="py-20 bg-cream">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center">
                    <h2 className="text-3xl font-semibold text-espresso sm:text-4xl">
                        Curated Plans
                    </h2>
                    <p className="mt-4 max-w-2xl mx-auto text-xl text-muted">
                        Choose the plan that&apos;s right for you
                    </p>
                </div>

                <div className="mt-16 space-y-12 lg:space-y-0 lg:grid lg:grid-cols-3 lg:gap-8">
                    {pricingPlans.map((plan, index) => (
                        <div key={index} className={`flex flex-col rounded-2xl shadow-sm overflow-hidden ${plan.highlighted ? 'border-2 border-terracotta lg:scale-105': 'border border-warmborder'}`}>
                            <div className={`px-6 py-8 bg-surface ${plan.highlighted ? 'bg-gradient-to-br from-terracotta-soft to-surface': ''}`}>
                                <div className="flex justify-between items-center">
                                    <h3 className="text-2xl font-medium text-espresso">
                                        {plan.name}
                                    </h3>
                                    {plan.highlighted && (
                                        <span className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-olive-soft text-olive">
                                            Recommended
                                        </span>
                                    )}
                                </div>
                                <p className="mt-4 text-sm text-muted">
                                    {plan.description}
                                </p>
                                <p className="mt-8">
                                    <span className="text-4xl font-semibold text-espresso">
                                        ₹{plan.price}
                                    </span>
                                </p>
                            </div>
                            <div className="flex-1 flex flex-col justify-between px-6 pt-6 pb-8 bg-cream space-y-6">
                                <ul className="space-y-4">
                                    {plan.features.map((feature, featureIndex) => (
                                        <li key={featureIndex} className="flex items-start">
                                            <div className="flex-shrink-0">
                                                <Check className="h-5 w-5 text-olive"/>
                                            </div>
                                            <p className="ml-3 text-base text-ink">{feature}</p>
                                        </li>
                                    ))}
                                </ul>
                                <div>
                                    <SignUpButton mode="modal">
                                        <button
                                            className={`w-full flex items-center justify-center px-5 py-3 text-base font-medium rounded-lg ${plan.highlighted ? 'text-white bg-terracotta hover:bg-terracotta-dark': 'text-terracotta bg-surface hover:bg-cream border border-terracotta'} transition-colors duration-200`}>
                                            {plan.cta}
                                        </button>
                                    </SignUpButton>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default PricingSection;
