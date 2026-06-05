import {Star} from "lucide-react";

const TestimonialsSection = ({testimonials}) => {
    return (
        <div className="py-20 bg-surface overflow-hidden">
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="relative">
                    <div className="text-center">
                        <h2 className="text-3xl font-semibold text-espresso sm:text-4xl">
                            Trusted by Professionals Worldwide
                        </h2>
                        <p className="mt-4 max-w-3xl mx-auto text-xl text-muted">
                            See what our users have to say about Cloud Share
                        </p>
                    </div>
                    <div className="mt-16 grid gap-8 lg:grid-cols-3">
                        {testimonials.map((testimonial, index) => (
                            <div key={index} className="bg-cream border border-warmborder rounded-2xl shadow-sm overflow-hidden transform transition duration-500 hover:shadow-md">
                                <div className="p-8">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0 h-12 w-12">
                                            <img src={testimonial.image} alt={testimonial.name} className="h-12 w-12 rounded-full"/>
                                        </div>
                                        <div className="ml-4">
                                            <h4 className="text-lg font-semibold text-espresso">{testimonial.name}</h4>
                                            <p className="text-sm text-muted">{testimonial.role}, {testimonial.company}</p>
                                        </div>
                                    </div>
                                    <div className="mt-4 flex items-center">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i}
                                                  size={16}
                                                  className={`${i < testimonial.rating ? 'text-terracotta' : 'text-warmborder'} fill-current`} />
                                        ))}
                                    </div>
                                    <blockquote className="mt-4">
                                        <p className="text-base italic text-ink font-serif">
                                            "{testimonial.quote}"
                                        </p>
                                    </blockquote>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default TestimonialsSection;