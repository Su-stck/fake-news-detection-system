import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

/** A soft trailing ring that grows over interactive elements (mouse devices only). */
export default function Cursor() {
  const [enabled, setEnabled] = useState(false);
  const [hot, setHot] = useState(false);
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const sx = useSpring(x, { stiffness: 380, damping: 32, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 380, damping: 32, mass: 0.4 });

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduce) return;
    setEnabled(true);

    const move = (e) => {
      x.set(e.clientX);
      y.set(e.clientY);
      setHot(!!e.target.closest?.("button, a, textarea, summary, [data-hot]"));
    };
    window.addEventListener("pointermove", move);
    return () => window.removeEventListener("pointermove", move);
  }, [x, y]);

  if (!enabled) return null;
  return (
    <motion.div
      className={`cursor ${hot ? "cursor-hot" : ""}`}
      style={{ x: sx, y: sy }}
      aria-hidden="true"
    />
  );
}
