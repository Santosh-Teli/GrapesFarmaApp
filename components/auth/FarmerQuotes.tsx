"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const quotes = [
  "The ultimate goal of farming is not the growing of crops, but the cultivation and perfection of human beings.",
  "Agriculture is our wisest pursuit, because it will in the end contribute most to real wealth, good morals, and happiness.",
  "To plant a garden is to believe in tomorrow.",
  "The farmer has to be an optimist or he wouldn't still be a farmer.",
  "Farming looks mighty easy when your plow is a pencil and you're a thousand miles from the farm."
];

export function FarmerQuotes() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prevIndex) => (prevIndex + 1) % quotes.length);
    }, 6000); // Change quote every 6 seconds

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="mt-8 h-40 relative overflow-hidden max-w-md">
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="absolute inset-0 flex items-center"
        >
          <div className="border-l-4 border-brand-accent/70 pl-5 py-2 w-full">
            <p className="text-brand-surface/90 italic font-playfair text-xl leading-relaxed">
              "{quotes[index]}"
            </p>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
