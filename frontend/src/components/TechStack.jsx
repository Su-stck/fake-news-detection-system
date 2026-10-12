import { motion } from "framer-motion";
import SectionHeading from "./SectionHeading.jsx";

const STACK = [
  { group: "Language", items: ["Python 3"] },
  { group: "Data & features", items: ["Pandas", "NumPy", "TF-IDF (scikit-learn)"] },
  { group: "Model", items: ["Logistic Regression", "Naive Bayes", "Linear SVM"] },
  { group: "API", items: ["Flask", "Flask-CORS", "joblib"] },
  { group: "Frontend", items: ["React", "Vite", "Framer Motion", "Lenis"] },
];

const container = { hidden: {}, show: { transition: { staggerChildren: 0.1 } } };
const item = {
  hidden: { opacity: 0, y: 30, rotateX: -20 },
  show: { opacity: 1, y: 0, rotateX: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

export default function TechStack() {
  return (
    <section id="tech-stack" className="stack-section">
      <SectionHeading kicker="Under the hood" title="A small, honest stack — nothing exotic." />

      <motion.div
        className="stack-grid"
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
      >
        {STACK.map((col) => (
          <motion.div key={col.group} className="stack-col" variants={item} whileHover={{ y: -6 }}>
            <h3>{col.group}</h3>
            <ul>
              {col.items.map((i) => (
                <li key={i}>{i}</li>
              ))}
            </ul>
          </motion.div>
        ))}
      </motion.div>

      <motion.pre
        className="arch"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.7 }}
      >
{`React (Vite)  ──POST /api/predict──▶  Flask API  ──▶  TF-IDF + classifier (scikit-learn)
     ▲                                   │
     └──────  label · confidence · signals ◀──┘`}
      </motion.pre>
    </section>
  );
}
