import { useEffect, useRef, useState } from "react";
import { animate, motion, useInView } from "framer-motion";

function Counter({ to, suffix = "", decimals = 0 }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.8 });
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const c = animate(0, to, { duration: 1.8, ease: [0.22, 1, 0.36, 1], onUpdate: setVal });
    return () => c.stop();
  }, [inView, to]);
  return (
    <span ref={ref}>
      {val.toFixed(decimals)}
      {suffix}
    </span>
  );
}

const STATS = [
  { to: 3, label: "classifiers compared", sub: "Logistic Regression, Naive Bayes, Linear SVM" },
  { to: 5000, label: "TF-IDF features", sub: "single words and two-word phrases" },
  { to: 6, label: "word minimum", sub: "short inputs are refused, not guessed at" },
  { to: 4, label: "pipeline steps", sub: "paste → clean → vectorise → classify" },
];

export default function Stats() {
  return (
    <section className="stats">
      <div className="stats-grid">
        {STATS.map((s, i) => (
          <motion.div
            className="stat"
            key={s.label}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.6, delay: i * 0.1 }}
          >
            <strong>
              <Counter to={s.to} />
            </strong>
            <span>{s.label}</span>
            <small>{s.sub}</small>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
