"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

const slides = [
  {
    image: "https://images.unsplash.com/photo-1596431527735-86699a224a02?auto=format&fit=crop&w=2000&q=80",
    quote: {
      en: "Farming is a profession of hope.",
      kn: "ಕೃಷಿ ಭರವಸೆಯ ವೃತ್ತಿಯಾಗಿದೆ.",
      hi: "खेती आशा का एक पेशा है।"
    }
  },
  {
    image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=2000&q=80",
    quote: {
      en: "Agriculture is our wisest pursuit.",
      kn: "ಕೃಷಿ ನಮ್ಮ ಅತ್ಯಂತ ಬುದ್ಧಿವಂತ ಅನ್ವೇಷಣೆಯಾಗಿದೆ.",
      hi: "कृषि हमारी सबसे बुद्धिमानी भरा काम है।"
    }
  },
  {
    image: "https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=2000&q=80",
    quote: {
      en: "The farmer is the only man in our economy who buys retail, sells wholesale, and pays the freight both ways.",
      kn: "ರೈತ ಮಾತ್ರ ನಮ್ಮ ಆರ್ಥಿಕತೆಯಲ್ಲಿ ಚಿಲ್ಲರೆಯಾಗಿ ಖರೀದಿಸಿ, ಸಗಟು ಮಾರಾಟ ಮಾಡಿ, ಎರಡೂ ಕಡೆ ಸರಕು ಸಾಗಣೆ ಪಾವತಿಸುವ ವ್ಯಕ್ತಿ.",
      hi: "किसान हमारी अर्थव्यवस्था में एकमात्र ऐसा व्यक्ति है जो खुदरा खरीदता है, थोक बेचता है, और दोनों तरफ का भाड़ा चुकाता है।"
    }
  }
];

export function BackgroundSlideshow() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-0">
      {/* Background Images */}
      {slides.map((slide, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentSlide ? "opacity-40" : "opacity-0"
            }`}
          style={{
            backgroundImage: `url('${slide.image}')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            transform: index === currentSlide ? 'scale(1.05)' : 'scale(1)',
            transition: 'opacity 1s ease-in-out, transform 6s linear'
          }}
        />
      ))}

      {/* Overlay to maintain the violet brand feel */}
      <div className="absolute inset-0 bg-brand-primary/80 mix-blend-multiply" />

      {/* Quotes Overlay */}
      <div className="absolute bottom-24 left-12 right-12 z-20">
        <div className="relative h-32">
          {slides.map((slide, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-all duration-1000 flex flex-col gap-2 ${index === currentSlide
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-4"
                }`}
            >
              <p className="text-brand-surface font-serif italic text-xl border-l-4 border-brand-accent pl-4">
                "{slide.quote.en}"
              </p>
              <p className="text-brand-surface/80 font-sans text-sm pl-5">
                {slide.quote.kn}
              </p>
              <p className="text-brand-surface/80 font-sans text-sm pl-5">
                {slide.quote.hi}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
