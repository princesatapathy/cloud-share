import {SignUpButton} from "@clerk/react";

const CTASection = () => {
    return (
        <div className="bg-espresso">
            <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between">
                <h2 className="text-3xl font-semibold tracking-tight text-cream sm:text-4xl">
                    <span className="block">Ready to get started?</span>
                    <span className="block text-terracotta italic">Create your account today.</span>
                </h2>
                <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0">
                    <div className="inline-flex">
                        <SignUpButton mode="modal">
                            <button
                                className="inline-flex items-center justify-center px-6 py-3 text-base font-medium rounded-lg text-white bg-terracotta hover:bg-terracotta-dark transition-colors duration-200 shadow-sm">
                                Sign up for free
                            </button>
                        </SignUpButton>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default CTASection;
