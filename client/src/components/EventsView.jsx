import React, { useEffect, useState, useRef } from "react";
import { apiFetch, resolveAssetUrl } from "../lib/api.js";
import { Calendar, MapPin, ChevronLeft, ChevronRight, X, Loader2 } from "lucide-react";

const FALLBACK_GALLERY = [
    "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=800&q=80",
];

function formatDate(iso) {
    if (!iso) return "Date TBA";
    try {
        return new Date(iso).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
    } catch {
        return iso;
    }
}

const STATUS_STYLE = {
    upcoming: "bg-emerald-50 text-emerald-700 border-emerald-200",
    past: "bg-slate-100 text-slate-500 border-slate-200",
    draft: "bg-amber-50 text-amber-700 border-amber-200",
};

export default function EventsView({ onNavigate }) {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedEventId, setSelectedEventId] = useState(null);
    const [selectedImage, setSelectedImage] = useState(null);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const stripRef = useRef(null);

    useEffect(() => {
        let cancelled = false;
        async function load() {
            try {
                const res = await apiFetch("/api/events");
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const data = await res.json();
                if (!cancelled) {
                    const sorted = [...data].sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
                    setEvents(sorted);
                    if (sorted.length > 0) setSelectedEventId(sorted[0].id);
                }
            } catch (err) {
                console.error("Failed to load events:", err);
            } finally {
                if (!cancelled) setLoading(false);
            }
        }
        load();
        return () => { cancelled = true; };
    }, []);

    const selectedEvent = events.find((e) => e.id === selectedEventId) || null;

    const handlePrevImage = () => {
        if (!selectedImage) return;
        setCurrentImageIndex((prev) =>
            prev === 0 ? selectedImage.gallery.length - 1 : prev - 1
        );
    };

    const handleNextImage = () => {
        if (!selectedImage) return;
        setCurrentImageIndex((prev) =>
            prev === selectedImage.gallery.length - 1 ? 0 : prev + 1
        );
    };

    const scrollStrip = (dir) => {
        if (!stripRef.current) return;
        stripRef.current.scrollBy({ left: dir * 320, behavior: "smooth" });
    };

    const selectedGallery = selectedEvent
        ? ((selectedEvent.gallery && selectedEvent.gallery.length > 0)
            ? selectedEvent.gallery
            : (selectedEvent.coverImage ? [selectedEvent.coverImage, ...FALLBACK_GALLERY] : FALLBACK_GALLERY))
        : [];

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

            {/* Horizontal Event Strip */}
            <section className="py-6 md:py-10">
                {loading ? (
                    <div className="flex justify-center py-12">
                        <Loader2 className="w-8 h-8 text-primary-orange animate-spin" />
                    </div>
                ) : events.length === 0 ? (
                    <div className="text-center py-12 text-sm text-slate-400 max-w-[1280px] mx-auto px-5 md:px-[64px]">
                        No events to show yet. Add some from the admin panel.
                    </div>
                ) : (
                    <div className="relative max-w-[1280px] mx-auto px-5 md:px-[64px]">
                        {/* Scroll buttons */}
                        {events.length > 1 && (
                            <>
                                <button
                                    onClick={() => scrollStrip(-1)}
                                    className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white border border-slate-200 shadow-md hover:shadow-lg rounded-full p-2 text-secondary-blue hover:text-primary-orange transition-colors"
                                    aria-label="Scroll left"
                                >
                                    <ChevronLeft className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={() => scrollStrip(1)}
                                    className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white border border-slate-200 shadow-md hover:shadow-lg rounded-full p-2 text-secondary-blue hover:text-primary-orange transition-colors"
                                    aria-label="Scroll right"
                                >
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                            </>
                        )}

                        <div
                            ref={stripRef}
                            className="flex gap-4 overflow-x-auto pb-3 snap-x snap-mandatory scroll-smooth [scrollbar-width:thin]"
                            style={{ scrollbarColor: "#cbd5e1 transparent" }}
                        >
                            {events.map((event) => {
                                const isActive = event.id === selectedEventId;
                                return (
                                    <button
                                        key={event.id}
                                        onClick={() => {
                                            setSelectedEventId(event.id);
                                            // Smooth-scroll the detail into view below
                                            setTimeout(() => {
                                                document.getElementById("event-detail")?.scrollIntoView({ behavior: "smooth", block: "start" });
                                            }, 60);
                                        }}
                                        className={`snap-start shrink-0 w-64 md:w-72 text-left rounded-2xl border-2 transition-all overflow-hidden bg-white hover:shadow-lg ${
                                            isActive
                                                ? "border-primary-orange shadow-lg shadow-primary-orange/20 -translate-y-1"
                                                : "border-slate-200 hover:border-slate-300"
                                        }`}
                                    >
                                        <div className="h-44 w-full overflow-hidden bg-slate-100 flex items-center justify-center">
                                            {event.coverImage ? (
                                                <img
                                                    src={resolveAssetUrl(event.coverImage)}
                                                    alt={event.title}
                                                    className="w-full h-full object-cover"
                                                    referrerPolicy="no-referrer"
                                                    onError={(e) => { e.currentTarget.style.display = "none"; }}
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-3xl text-slate-300 bg-gradient-to-br from-primary-orange/10 to-secondary-blue/10">
                                                    📅
                                                </div>
                                            )}
                                        </div>
                                        <div className="p-4">
                                            <div className="flex items-center gap-1.5 text-[10px] font-semibold text-primary-orange uppercase tracking-wider">
                                                <Calendar className="w-3 h-3" />
                                                <span>{event.date ? new Date(event.date).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }) : "TBA"}</span>
                                            </div>
                                            <h3 className={`mt-1.5 font-bold leading-snug line-clamp-2 ${isActive ? "text-primary-orange" : "text-secondary-blue"}`}>
                                                {event.title}
                                            </h3>
                                            <div className="mt-2 flex items-center gap-1 text-[11px] text-slate-500">
                                                <MapPin className="w-3 h-3" />
                                                <span className="line-clamp-1">{event.location || "TBA"}</span>
                                            </div>
                                            {event.status && (
                                                <span className={`mt-2 inline-block text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${STATUS_STYLE[event.status] || STATUS_STYLE.upcoming}`}>
                                                    {event.status}
                                                </span>
                                            )}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}
            </section>

            {/* Selected Event Detail */}
            {!loading && selectedEvent && (
                <section id="event-detail" className="py-8 md:py-16 max-w-[1280px] mx-auto px-5 md:px-[64px] scroll-mt-8">
                    <div className="space-y-8">
                        {/* Event Header */}
                        <div className="text-center max-w-[800px] mx-auto flex flex-col items-center gap-4">
                            <div className="inline-flex items-center gap-2 bg-primary-orange/10 border border-primary-orange/20 text-primary-orange px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide">
                                <Calendar className="w-3.5 h-3.5" />
                                <span>{formatDate(selectedEvent.date)}</span>
                                {selectedEvent.status && (
                                    <span className="ml-2 px-2 py-0.5 rounded-full bg-white/40 text-[10px] uppercase tracking-wider">
                                        {selectedEvent.status}
                                    </span>
                                )}
                            </div>

                            <h2 className="text-2xl md:text-4xl font-bold text-secondary-blue">
                                {selectedEvent.title}
                            </h2>

                            <div className="flex items-center justify-center gap-2 text-[#5a4136]/70">
                                <MapPin className="w-5 h-5 text-primary-orange" />
                                <span className="text-base">{selectedEvent.location || "Location TBA"}</span>
                            </div>

                            {selectedEvent.description && (
                                <p className="text-base md:text-lg text-[#5a4136]/80 leading-relaxed">
                                    {selectedEvent.description}
                                </p>
                            )}
                        </div>

                        {/* Photo Gallery Grid */}
                        <div className="flex justify-center">
                            <div className="w-full grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                {selectedGallery.map((image, index) => (
                                    <div
                                        key={index}
                                        className="group relative h-48 md:h-56 rounded-xl overflow-hidden cursor-pointer glass-card hover:shadow-lg transition-all duration-300"
                                        onClick={() => {
                                            setSelectedImage({ ...selectedEvent, gallery: selectedGallery });
                                            setCurrentImageIndex(index);
                                        }}
                                    >
                                        <img
                                            src={resolveAssetUrl(image)}
                                            alt={`${selectedEvent.title} - Photo ${index + 1}`}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                            referrerPolicy="no-referrer"
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
                    </div>
                </section>
            )}

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
                                src={resolveAssetUrl(selectedImage.gallery[currentImageIndex])}
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
