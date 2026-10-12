import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const WORDS = ["The", "Verification", "Desk"];

export default function Preloader({ onDone }) {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const t = setTimeout(() => setShow(false), reduce ? 50 : 2100);
    return () => clearTimeout(t);
  }, []);

  return (
    <AnimatePresence onExitComplete={onDone}>
      {show && (
        <motion.div
          className="preloader"
          exit={{ y: "-100%" }}
          transition={{ duration: 0.9, ease: [0.76, 0, 0.24, 1] }}
        >
          <div className="preloader-inner">
            <motion.span
              className="preloader-rule"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 1.1, ease: "easeInOut" }}
            />
            <h1 className="preloader-title">
              {WORDS.map((w, i) => (
                <span className="mask" key={w}>
                  <motion.span
                    style={{ display: "inline-block" }}
                    initial={{ y: "110%" }}
                    animate={{ y: 0 }}
                    transition={{ duration: 0.8, delay: 0.25 + i * 0.14, ease: [0.22, 1, 0.36, 1] }}
                  >
                    {w}&nbsp;
                  </motion.span>
                </span>
              ))}
            </h1>
            <motion.p
              className="preloader-sub"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
            >
              Est. by machine learning · Reading the shape of language
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
