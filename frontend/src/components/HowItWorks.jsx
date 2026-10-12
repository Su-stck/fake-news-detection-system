import { useRef, useState } from "react";
import { AnimatePresence, motion, useMotionValueEvent, useScroll, useSpring } from "framer-motion";
import SectionHeading from "./SectionHeading.jsx";

const STEPS = [
  {
    n: "01",
    title: "You paste an article",
    body: "A headline or a few sentences of body text — the same kind of copy the model saw thousands of examples of during training.",
  },
  {
    n: "02",
    title: "The text gets cleaned",
    body: "URLs, punctuation, numbers and common filler words are stripped out, leaving only the words that actually carry signal.",
  },
  {
    n: "03",
    title: "TF-IDF turns words into numbers",
    body: "Every remaining word is weighed by how distinctive it is — rare, telling words count for more than common ones.",
  },
  {
    n: "04",
    title: "The classifier renders a verdict",
    body: "A model trained on labelled articles compares the pattern against what it learned, and stamps REAL or FAKE.",
  },
];

const SENTENCE = [
  ["The", true], ["finance", false], ["ministry", false], ["confirmed", false], ["that", true],
  ["the", true], ["figures", false], ["will", false], ["be", true], ["released", false], ["next", false], ["week", false],
];
const WEIGHTS = [
  ["released", 0.9], ["ministry", 0.78], ["confirmed", 0.7], ["figures", 0.55], ["finance", 0.5], ["week", 0.32],
];

function StepPaste() {
  const full = SENTENCE.map((s) => s[0]).join(" ") + ".";
  return (
    <div className="viz viz-paste">
      <span className="viz-label">article.txt</span>
      <p>
        {full.split("").map((ch, i) => (
          <motion.span
            key={i}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.025, duration: 0.01 }}
          >
            {ch}
          </motion.span>
        ))}
        <span className="caret" />
      </p>
    </div>
  );
}

function StepClean() {
  return (
    <div className="viz viz-clean">
      <span className="viz-label">clean_text()</span>
      <div className="chips">
        {SENTENCE.map(([w, stop], i) => (
          <motion.span
            key={i}
            className={`chip ${stop ? "chip-stop" : "chip-keep"}`}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: stop ? [1, 1, 0.28] : 1, y: 0 }}
            transition={{ delay: i * 0.06, duration: stop ? 1.4 : 0.4, times: stop ? [0, 0.6, 1] : undefined }}
          >
            {w}
          </motion.span>
        ))}
      </div>
      <p className="viz-note">Greyed-out words are stopwords — dropped before the model ever sees them.</p>
    </div>
  );
}

function StepTfidf() {
  return (
    <div className="viz viz-tfidf">
      <span className="viz-label">tfidf_vector</span>
      {WEIGHTS.map(([w, v], i) => (
        <div className="bar-row" key={w}>
          <span>{w}</span>
          <div className="bar-track">
            <motion.div
              className="bar-fill"
              initial={{ width: 0 }}
              animate={{ width: `${v * 100}%` }}
              transition={{ delay: 0.1 + i * 0.1, duration: 0.8, ease: "easeOut" }}
            />
          </div>
          <em>{v.toFixed(2)}</em>
        </div>
      ))}
    </div>
  );
}

function StepVerdict() {
  return (
    <div className="viz viz-verdict">
      <span className="viz-label">model.predict()</span>
      <motion.div
        className="stamp stamp-real stamp-static"
        initial={{ scale: 2.6, rotate: -22, opacity: 0 }}
        animate={{ scale: 1, rotate: -6, opacity: 1 }}
        transition={{ type: "spring", stiffness: 420, damping: 16, delay: 0.25 }}
      >
        REAL
      </motion.div>
      <motion.p
        className="viz-note"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        …together with a confidence score and the words that tipped the decision.
      </motion.p>
    </div>
  );
}

const VIZ = [StepPaste, StepClean, StepTfidf, StepVerdict];

export default function HowItWorks() {
  const ref = useRef(null);
  const [active, setActive] = useState(0);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const lineScale = useSpring(scrollYProgress, { stiffness: 120, damping: 28 });

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    setActive(Math.min(STEPS.length - 1, Math.max(0, Math.floor(v * STEPS.length))));
  });

  const Viz = VIZ[active];

  return (
    <section id="how-it-works" className="how" ref={ref}>
      <div className="how-sticky">
        <SectionHeading kicker="How it works" title="From pasted text to a stamped verdict, in four steps." />

        <div className="how-stage">
          <div className="how-rail">
            <div className="how-rail-line">
              <motion.div className="how-rail-fill" style={{ scaleY: lineScale }} />
            </div>
            <ol className="how-list">
              {STEPS.map((s, i) => (
                <li key={s.n} className={`how-item ${i === active ? "is-active" : ""} ${i < active ? "is-done" : ""}`}>
                  <span className="how-step-n">{s.n}</span>
                  <div>
                    <h3>{s.title}</h3>
                    <motion.p
                      initial={false}
                      animate={{ height: i === active ? "auto" : 0, opacity: i === active ? 1 : 0 }}
                      transition={{ duration: 0.4 }}
                    >
                      {s.body}
                    </motion.p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <div className="how-visual">
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{ opacity: 0, y: 24, filter: "blur(6px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -24, filter: "blur(6px)" }}
                transition={{ duration: 0.35 }}
              >
                <Viz />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
