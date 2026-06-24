import React, { useState } from "react";
import { Calendar, MapPin, ChevronLeft, ChevronRight, X } from "lucide-react";

const EVENTS_DATA = [
    {
        id: 1,
        title: "Startup Networking Summit 2024",
        description:
            "Connect with fellow entrepreneurs, investors, and mentors in the Barishal startup ecosystem. This premier networking event brings together industry leaders, successful founders, and venture capitalists to share insights, build meaningful relationships, and explore collaboration opportunities that can accelerate your startup's growth.",
        date: "June 25, 2024",
        location: "Barishal Innovation Hub",
        gallery: [
            "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=800&q=80",
        ],
    },
    {
        id: 2,
        title: "Product Development Workshop",
        description:
            "Learn essential skills in MVP development, product-market fit, and customer validation. Expert instructors will guide you through real-world case studies, hands-on exercises, and practical frameworks you can apply immediately to your product strategy.",
        date: "July 5, 2024",
        location: "Tech Academy Center",
        gallery: [
            "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=800&q=80",
        ],
    },
    {
        id: 3,
        title: "Fundraising Masterclass",
        description:
            "Understand the investor perspective and learn how to pitch your startup effectively. Topics include equity structures, valuation methodologies, due diligence processes, and long-term investor relations strategies that build sustainable partnerships.",
        date: "July 15, 2024",
        location: "Business District Conference Room",
        gallery: [
            "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=800&q=80",
        ],
    },
    {
        id: 4,
        title: "Tech Demo Day",
        description:
            "Showcase your innovative products to a room full of investors, media, and industry experts. This is a unique opportunity to present your MVP, demonstrate your market traction, and secure potential funding and partnership opportunities.",
        date: "August 10, 2024",
        location: "Grand Convention Hall",
        gallery: [
            "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=800&q=80",
        ],
    },
];

export default function EventsView({ onNavigate }) {
    const [selectedImage, setSelectedImage] = useState(null);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const handlePrevImage = () => {
        setCurrentImageIndex((prev) =>
            prev === 0 ? selectedImage.gallery.length - 1 : prev - 1
        );
    };

    const handleNextImage = () => {
        setCurrentImageIndex((prev) =>
            prev === selectedImage.gallery.length - 1 ? 0 : prev + 1
        );
    };

    return (
        <div className="animate-fadeIn">
            {/* Hero Section */}
            <section className="py-12 md:py-20 max-w-[1280px] mx-auto px-5 md:px-[64px]">
                <div className="text-center max-w-[800px] mx-auto flex flex-col gap-4">
                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-secondary-blue leading-tight">
                        Events Gallery & 
                        <span className="text-primary-orange"> Showcase</span>
                    </h1>
                    <div className="w-16 h-1 bg-primary-orange mx-auto rounded"></div>
                    <p className="text-base md:text-lg text-[#5a4136]/80 leading-relaxed">
                        Explore moments from our community events, networking sessions, and startup celebrations. Connect with fellow entrepreneurs and discover opportunities.
                    </p>
                </div>
            </section>

            {/* Events Section */}
            <section className="py-8 md:py-16 max-w-[1280px] mx-auto px-5 md:px-[64px]">
                <div className="space-y-20">
                    {EVENTS_DATA.map((event) => (
                        <div key={event.id} className="space-y-8">
                            {/* Event Header */}
                            <div className="text-center max-w-[800px] mx-auto flex flex-col items-center gap-4">
                                <div className="inline-flex items-center gap-2 bg-primary-orange/10 border border-primary-orange/20 text-primary-orange px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide">
                                    <Calendar className="w-3.5 h-3.5" />
                                    <span>{event.date}</span>
                                </div>

                                <h2 className="text-2xl md:text-4xl font-bold text-secondary-blue">
                                    {event.title}
                                </h2>

                                <div className="flex items-center justify-center gap-2 text-[#5a4136]/70">
                                    <MapPin className="w-5 h-5 text-primary-orange" />
                                    <span className="text-base">{event.location}</span>
                                </div>

                                <p className="text-base md:text-lg text-[#5a4136]/80 leading-relaxed">
                                    {event.description}
                                </p>
                            </div>

                            {/* Photo Gallery Grid - Centered */}
                            <div className="flex justify-center">
                                <div className="w-full grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                    {event.gallery.map((image, index) => (
                                        <div
                                            key={index}
                                            className="group relative h-48 md:h-56 rounded-xl overflow-hidden cursor-pointer glass-card hover:shadow-lg transition-all duration-300"
                                            onClick={() => {
                                                setSelectedImage(event);
                                                setCurrentImageIndex(index);
                                            }}
                                        >
                                            <img
                                                src={image}
                                                alt={`${event.title} - Photo ${index + 1}`}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                            />
                                            <div className="absolute inset-0 bg-primary-orange/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                                <div className="text-white font-semibold text-sm bg-primary-orange/70 px-3 py-1 rounded-lg">
                                                    View
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Divider */}
                            <div className="h-px bg-slate-200" />
                        </div>
                    ))}
                </div>
            </section>

            {/* Lightbox Modal */}
            {selectedImage && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
                    <div className="relative bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                        {/* Close Button */}
                        <button
                            onClick={() => setSelectedImage(null)}
                            className="absolute top-4 right-4 z-10 bg-white/90 hover:bg-white rounded-full p-2 transition-colors shadow-lg"
                            aria-label="Close gallery"
                        >
                            <X className="w-6 h-6 text-secondary-blue" />
                        </button>

                        {/* Image Container */}
                        <div className="relative flex-1 bg-slate-100 overflow-hidden">
                            <img
                                src={selectedImage.gallery[currentImageIndex]}
                                alt={`${selectedImage.title} - Photo ${currentImageIndex + 1}`}
                                className="w-full h-full object-contain"
                            />

                            {/* Navigation Buttons */}
                            <button
                                onClick={handlePrevImage}
                                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-secondary-blue rounded-full p-3 transition-all shadow-lg hover:shadow-xl"
                                aria-label="Previous image"
                            >
                                <ChevronLeft className="w-6 h-6" />
                            </button>
                            <button
                                onClick={handleNextImage}
                                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-secondary-blue rounded-full p-3 transition-all shadow-lg hover:shadow-xl"
                                aria-label="Next image"
                            >
                                <ChevronRight className="w-6 h-6" />
                            </button>

                            {/* Image Counter */}
                            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-secondary-blue/90 text-white px-4 py-2 rounded-full text-sm font-semibold">
                                {currentImageIndex + 1} / {selectedImage.gallery.length}
                            </div>
                        </div>

                        {/* Image Info */}
                        <div className="p-6 bg-white border-t border-slate-200">
                            <h3 className="text-xl md:text-2xl font-bold text-secondary-blue mb-2">
                                {selectedImage.title}
                            </h3>
                            <p className="text-[#5a4136]/70 text-sm md:text-base">
                                Photo {currentImageIndex + 1} from the event gallery
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
