import { useRef } from "react";
import {
  motion, useAnimationFrame, useMotionValue, useScroll, useSpring, useTransform, useVelocity,
} from "framer-motion";

const ITEMS = [
  "Check before you share", "Language leaves fingerprints", "TF-IDF · Logistic Regression · Naive Bayes · Linear SVM",
  "Style is not truth", "Verify with a primary source", "Paste · Read · Stamp",
];

/** Marquee whose speed (and direction) reacts to scroll velocity. */
export default function Ticker() {
  const x = useMotionValue(0);
  const { scrollY } = useScroll();
  const velocity = useVelocity(scrollY);
  const smooth = useSpring(velocity, { damping: 50, stiffness: 400 });
  const boost = useTransform(smooth, [-1500, 0, 1500], [-5, 0, 5], { clamp: false });
  const dir = useRef(1);
  const trackRef = useRef(null);

  useAnimationFrame((_, delta) => {
    const b = boost.get();
    if (b !== 0) dir.current = b > 0 ? 1 : -1;
    const move = dir.current * (0.6 + Math.abs(b)) * (delta / 16);
    const w = trackRef.current ? trackRef.current.scrollWidth / 2 : 1;
    let next = x.get() - move;
    if (next <= -w) next += w;
    if (next > 0) next -= w;
    x.set(next);
  });

  const row = [...ITEMS, ...ITEMS];
  return (
    <div className="ticker" aria-hidden="true">
      <motion.div className="ticker-track" ref={trackRef} style={{ x }}>
        {[...row, ...row].map((t, i) => (
          <span key={i} className="ticker-item">
            {t} <i>✦</i>
          </span>
        ))}
      </motion.div>
    </div>
  );
}
