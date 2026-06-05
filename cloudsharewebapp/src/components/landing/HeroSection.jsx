import {SignInButton, SignUpButton} from "@clerk/react";

const HeroSection = () => {
    return (
        <div className="landing-page-content relative">
            <div className="absolute inset-0 bg-gradient-to-br from-terracotta-soft via-cream to-olive-soft opacity-60 z-0 pointer-events-none"></div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="pt-20 pb-20 sm:pt-24 lg:pt-28 lg:pb-28">
                    <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">

                        {/* Left — copy */}
                        <div>
                            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-terracotta mb-5">
                                Elevate your workflow
                            </p>
                            <h1 className="text-5xl md:text-6xl font-semibold text-espresso leading-[1.05]">
                                Share your files,
                                <span className="block text-terracotta italic">beautifully</span>
                            </h1>
                            <p className="mt-6 max-w-lg text-lg text-muted leading-relaxed">
                                A premium editorial storage space designed for clarity and focus.
                                Ditch the clutter and present your assets with the elegance they deserve.
                            </p>
                            <div className="mt-9 flex flex-wrap gap-4">
                                <SignUpButton mode="modal">
                                    <button className="px-7 py-3 text-base font-medium rounded-lg text-white bg-terracotta hover:bg-terracotta-dark transition-all duration-200 shadow-sm hover:shadow-md">
                                        Start Sharing
                                    </button>
                                </SignUpButton>
                                <SignInButton mode="modal">
                                    <button className="px-7 py-3 text-base font-medium rounded-lg text-ink bg-surface border border-warmborder hover:bg-cream transition-all duration-200">
                                        Sign In
                                    </button>
                                </SignInButton>
                            </div>
                        </div>

                        {/* Right — editorial visual (CSS arch + light) */}
                        <div className="relative">
                            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-warmborder shadow-sm bg-gradient-to-br from-[#E8D3C4] via-terracotta-soft to-cream">
                                {/* back arch */}
                                <div className="absolute bottom-0 left-[18%] w-[34%] h-[78%] rounded-t-full bg-[#D9A98C]"></div>
                                {/* front arch */}
                                <div className="absolute bottom-0 left-[44%] w-[30%] h-[64%] rounded-t-full bg-terracotta"></div>
                                {/* floor line */}
                                <div className="absolute bottom-[14%] left-0 right-0 h-px bg-espresso/10"></div>
                                {/* diagonal light beam */}
                                <div className="absolute -inset-1 bg-gradient-to-tr from-espresso/25 via-transparent to-cream/50 mix-blend-multiply"></div>
                                <div className="absolute inset-0 bg-gradient-to-bl from-white/30 via-transparent to-transparent"></div>
                            </div>
                            {/* soft offset shadow accent */}
                            <div className="absolute -z-10 -bottom-4 -right-4 w-2/3 h-2/3 rounded-2xl bg-olive-soft"></div>
                        </div>

                    </div>

                    <div className="mt-16 text-center">
                        <p className="text-base text-muted">
                            All your files are encrypted and stored securely with enterprise-grade security protocols.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default HeroSection;
