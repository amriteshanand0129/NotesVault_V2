import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";

const text = "Looking for college notes ? Check out our Resources";

const Heading = () => {
  const [displayedText, setDisplayedText] = useState("");
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      setDisplayedText((prev) => {
        if (index < text.length) {
          const updatedText = prev + text[index];
          index++; // Increment after adding the letter
          return updatedText;
        } else {
          clearInterval(interval);
          setTimeout(() => setShowButton(true), 500);
          return prev; // Prevent adding undefined
        }
      });
    }, 50);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center h-[45vh] text-center p-2 sm:mt-20 lg:mt-40">
      {/* Typing Text Effect */}
      <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-['Sour_Gummy'] bg-gradient-to-r from-purple-500 to-blue-500 text-transparent bg-clip-text">{displayedText}</h1>

      {/* Button - Fades in after text animation */}
      {showButton && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.5 }} className="sm:mt-4 lg:mt-12">
          <Link to="/resources" className="mt-4 px-6 py-3 text-lg sm:text-xl font-semibold text-white bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg shadow-md hover:opacity-80 transition flex items-center gap-2">
            <span className="flex items-center gap-2">
              Resources
              <img src="/arrow.png" alt="arrow" className="size-8" />
            </span>
          </Link>
        </motion.div>
      )}
    </div>
  );
};

export default Heading;
