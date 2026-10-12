import { useEffect, useState } from "react";
import { motion, useScroll, useSpring } from "framer-motion";
import { scrollToId } from "../hooks/useLenis.js";

const LINKS = [
  { id: "how-it-works", label: "How it works" },
  { id: "try-it", label: "Try it" },
  { id: "results", label: "Results" },
  { id: "tech-stack", label: "Tech stack" },
  { id: "faq", label: "FAQ" },
];

export default function Navbar() {
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 24, mass: 0.3 });
  const [active, setActive] = useState("");
  const [solid, setSolid] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: "-45% 0px -50% 0px" }
    );
    LINKS.forEach((l) => {
      const el = document.getElementById(l.id);
      if (el) obs.observe(el);
    });
    const onScroll = () => setSolid(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      obs.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <header className={`navbar ${solid ? "navbar-solid" : ""}`}>
      <motion.div className="scroll-progress" style={{ scaleX: progress }} />
      <div className="navbar-inner">
        <button className="navbar-brand" onClick={() => scrollToId("top")}>
          <span className="brand-mark">V</span> The Verification Desk
        </button>
        <nav className="navbar-links" aria-label="Sections">
          {LINKS.map((l) => (
            <button
              key={l.id}
              className={active === l.id ? "is-active" : ""}
              onClick={() => scrollToId(l.id)}
            >
              {l.label}
              {active === l.id && <motion.span layoutId="nav-underline" className="nav-underline" />}
            </button>
          ))}
        </nav>
      </div>
    </header>
  );
}
