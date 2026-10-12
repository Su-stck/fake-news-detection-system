import { useRef } from "react";
import { motion, useScroll, useTransform, useMotionValue, useSpring } from "framer-motion";
import { scrollToId } from "../hooks/useLenis.js";
import Magnetic from "./Magnetic.jsx";

const CLIPPINGS = [
  { text: "Ministry confirms inflation figures due next week", tag: "REAL", cls: "c1", speed: -140 },
  { text: "SHOCKING: Doctors hate this one weird trick!!!", tag: "FAKE", cls: "c2", speed: -260 },
  { text: "Central bank publishes routine quarterly review", tag: "REAL", cls: "c3", speed: -90 },
  { text: "Insiders reveal the cover-up they don't want you to see", tag: "FAKE", cls: "c4", speed: -200 },
];

const LINE1 = ["Not", "everything"];
const LINE2 = ["printed", "is", "true."];

function Words({ words, start, ready, className }) {
  return words.map((w, i) => (
    <span className="mask" key={w + i}>
      <motion.span
        className={className}
        style={{ display: "inline-block" }}
        initial={{ y: "115%", rotate: 4 }}
        animate={ready ? { y: 0, rotate: 0 } : {}}
        transition={{ duration: 0.9, delay: start + i * 0.09, ease: [0.22, 1, 0.36, 1] }}
      >
        {w}&nbsp;
      </motion.span>
    </span>
  ));
}

export default function Hero({ ready }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });

  const headlineY = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const fade = useTransform(scrollYProgress, [0, 0.75], [1, 0]);
  const glowY = useTransform(scrollYProgress, [0, 1], [0, 220]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.92]);

  // mouse parallax on the clippings
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const smx = useSpring(mx, { stiffness: 60, damping: 18 });
  const smy = useSpring(my, { stiffness: 60, damping: 18 });

  function onMove(e) {
    const r = ref.current.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width - 0.5);
    my.set((e.clientY - r.top) / r.height - 0.5);
  }

  return (
    <section id="top" className="hero" ref={ref} onMouseMove={onMove}>
      <motion.div className="hero-glow" style={{ opacity: fade, y: glowY }} />

      {CLIPPINGS.map((c, i) => (
        <Clipping key={c.cls} c={c} scrollYProgress={scrollYProgress} smx={smx} smy={smy} ready={ready} i={i} />
      ))}

      <motion.div className="hero-content" style={{ y: headlineY, opacity: fade, scale }}>
        <motion.span
          className="hero-kicker"
          initial={{ opacity: 0, y: 10 }}
          animate={ready ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <span className="live-dot" /> A minor project in machine learning
        </motion.span>

        <h1>
          <Words words={LINE1} start={0.1} ready={ready} />
          <br />
          <Words words={LINE2} start={0.35} ready={ready} className="hero-em" />
        </h1>

        <motion.p
          className="hero-byline"
          initial={{ opacity: 0, y: 16 }}
          animate={ready ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          This desk reads a headline the way a machine-learning model does — by the shape of its
          language, not its source. Paste an article and watch it get stamped REAL or FAKE.
        </motion.p>

        <motion.div
          className="hero-actions"
          initial={{ opacity: 0, y: 16 }}
          animate={ready ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.95 }}
        >
          <Magnetic>
            <button className="hero-cta" onClick={() => scrollToId("try-it")}>
              Try the detector ↓
            </button>
          </Magnetic>
          <button className="hero-ghost" onClick={() => scrollToId("how-it-works")}>
            See how it works
          </button>
        </motion.div>
      </motion.div>

      <motion.div
        className="hero-scroll-hint"
        style={{ opacity: fade }}
        initial={{ opacity: 0 }}
        animate={ready ? { opacity: 1 } : {}}
        transition={{ duration: 0.6, delay: 1.4 }}
      >
        <span className="hero-scroll-line" />
        scroll
      </motion.div>
    </section>
  );
}

function Clipping({ c, scrollYProgress, smx, smy, ready, i }) {
  const y = useTransform(scrollYProgress, [0, 1], [0, -c.speed]);
  const px = useTransform(smx, [-0.5, 0.5], [-14 * (i + 1), 14 * (i + 1)]);
  const py = useTransform(smy, [-0.5, 0.5], [-10 * (i + 1), 10 * (i + 1)]);
  return (
    <motion.div className={`clipping ${c.cls}`} style={{ y, x: px, translateY: py }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.85 }}
        animate={ready ? { opacity: 1, scale: 1, y: [0, -10, 0] } : {}}
        transition={{
          opacity: { duration: 0.7, delay: 1 + i * 0.15 },
          scale: { duration: 0.7, delay: 1 + i * 0.15 },
          y: { duration: 5 + i, repeat: Infinity, ease: "easeInOut", delay: i * 0.4 },
        }}
      >
        <p>{c.text}</p>
        <span className={`clip-tag ${c.tag === "REAL" ? "tag-real" : "tag-fake"}`}>{c.tag}</span>
      </motion.div>
    </motion.div>
  );
}
