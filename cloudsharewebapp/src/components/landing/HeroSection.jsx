import {assets} from "../../assets/assets.js";
import {SignInButton, SignUpButton} from "@clerk/react";

const HeroSection = () => {
    return (
        <div className="landing-page-content relative">
            <div className="absolute inset-0 bg-gradient-to-br from-terracotta-soft via-cream to-olive-soft opacity-70 z-0 pointer-events-none"></div>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="pt-20 pb-16 sm:pt-24 sm:pb-20 lg:pt-32 lg:pb-28">
                    <div className="text-center">
                        <h1 className="text-4xl tracking-tight font-semibold text-espresso sm:text-5xl md:text-6xl leading-tight">
                            <span className="block">Share your files,</span>
                            <span className="block text-terracotta italic">beautifully.</span>
                        </h1>
                        <p className="mt-5 max-w-md mx-auto text-base text-muted sm:text-lg md:mt-6 md:text-xl md:max-w-2xl">
                            A premium storage space designed for clarity and focus. Upload, manage, and share your files with the elegance they deserve.
                        </p>
                        <div className="mt-10 max-w-sm mx-auto sm:max-w-none sm:flex sm:justify-center">
                            <div className="space-y-4 sm:space-y-0 sm:mx-auto sm:inline-grid sm:grid-cols-2 sm:gap-5">
                                <SignUpButton mode="modal">
                                    <button
                                        className="flex items-center justify-center px-6 py-3 text-base font-medium rounded-lg text-white bg-terracotta hover:bg-terracotta-dark md:py-4 md:text-lg md:px-10 transition-all duration-200 shadow-sm hover:shadow-md">Get Started</button>
                                </SignUpButton>
                                <SignInButton mode="modal">
                                    <button
                                        className="flex items-center justify-center px-6 py-3 border border-warmborder text-base font-medium rounded-lg text-ink bg-surface hover:bg-cream md:py-4 md:text-lg md:px-10 transition-all duration-200">Sign In</button>
                                </SignInButton>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="relative">
                    <div className="aspect-w-16 rounded-lg shadow-xl overflow-hidden">
                        <img src={assets.dashboard} alt="cloudshare dashboard" className="w-full h-full object-cover" />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black opacity-10 rounded-lg"></div>
                </div>

                <div className="mt-8 text-center">
                    <p className="mt-4 text-base text-muted">
                        All your files are encrypted and stored securely with enterprise-grade security protocols.
                    </p>
                </div>
            </div>
        </div>
    )
}

export default HeroSection;
