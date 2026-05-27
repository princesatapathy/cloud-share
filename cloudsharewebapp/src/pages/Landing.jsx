import HeroSection from "../components/landing/HeroSection.jsx";
import FeaturesSection from "../components/landing/FeaturesSection.jsx";
import PricingSection from "../components/landing/PricingSection.jsx";
import TestimonialsSection from "../components/landing/TestimonialsSection.jsx";
import CTASection from "../components/landing/CTASection.jsx";
import Footer from "../components/landing/Footer.jsx";
import {features, pricingPlans, testimonials} from "../assets/data.js";
import {useUser} from "@clerk/react";
import {useNavigate} from "react-router-dom";
import {useEffect} from "react";

const Landing = () => {
    const {isSignedIn } = useUser();
    const navigate = useNavigate();

    useEffect(() => {
        if (isSignedIn) {
            navigate("/dashboard");
        }
    }, [isSignedIn, navigate]);

    return (
        <div className="landing-page bg-gradient-to-b from-gray-50 to-gray-100">
            {/* Hero Section*/}
            <HeroSection />

            {/* Features section*/}
            <FeaturesSection features={features}/>

            {/* Pricing section*/}
            <PricingSection pricingPlans={pricingPlans}/>

            {/* Testimonials section*/}
            <TestimonialsSection testimonials={testimonials} />

            {/* CTA section*/}
            <CTASection />

            {/* Footer section*/}
            <Footer />
        </div>
    )
}

export default Landing;
