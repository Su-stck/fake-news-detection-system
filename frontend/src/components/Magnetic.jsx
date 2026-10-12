import { useRef } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

/** Wrapper that gently pulls its child toward the pointer. */
export default function Magnetic({ children, strength = 0.35 }) {
  const ref = useRef(null);
  const x = useSpring(useMotionValue(0), { stiffness: 220, damping: 16, mass: 0.2 });
  const y = useSpring(useMotionValue(0), { stiffness: 220, damping: 16, mass: 0.2 });

  function move(e) {
    const r = ref.current.getBoundingClientRect();
    x.set((e.clientX - (r.left + r.width / 2)) * strength);
    y.set((e.clientY - (r.top + r.height / 2)) * strength);
  }
  function leave() {
    x.set(0);
    y.set(0);
  }
  return (
    <motion.div ref={ref} style={{ x, y, display: "inline-block" }} onMouseMove={move} onMouseLeave={leave}>
      {children}
    </motion.div>
  );
}
