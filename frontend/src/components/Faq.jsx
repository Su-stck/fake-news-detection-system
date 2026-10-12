import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import SectionHeading from "./SectionHeading.jsx";

const QA = [
  {
    q: "Does this actually check whether something is true?",
    a: "No. It never looks up facts. It learns the statistical style of articles labelled real or fake — vocabulary, phrasing, sensationalism — and judges new text by how closely it resembles each group. A well-written false article can fool it, and an awkwardly written true one can be flagged.",
  },
  {
    q: "Why does it refuse very short input?",
    a: "With fewer than six meaningful words there is almost no pattern to read, so any verdict would be a coin flip dressed up as an answer. The API returns a clear message instead.",
  },
  {
    q: "What do the highlighted words mean?",
    a: "For linear models each word has a learned weight. The chips show the words in your text with the largest weight × TF-IDF score, coloured by which label they push toward. It is an explanation of the model, not of the world.",
  },
  {
    q: "How reliable is it on real news?",
    a: "Models trained on the Kaggle dataset can look nearly perfect partly because of quirks in the data (for example, many real articles begin with a wire-agency tag). Expect lower accuracy on text from other sources, and always verify important claims against a primary source.",
  },
  {
    q: "How do I retrain it on my own data?",
    a: "Put True.csv and Fake.csv in backend/data/, then run python preprocess.py and python train.py. The API and this page pick up the new model and metrics automatically.",
  },
];

export default function Faq() {
  const [open, setOpen] = useState(0);
  return (
    <section id="faq" className="faq-section">
      <SectionHeading kicker="Good to know" title="Limits, honestly stated." />
      <div className="faq-list">
        {QA.map((item, i) => (
          <motion.div
            key={item.q}
            className={`faq-item ${open === i ? "is-open" : ""}`}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.5, delay: i * 0.06 }}
          >
            <button onClick={() => setOpen(open === i ? -1 : i)} aria-expanded={open === i}>
              <span>{item.q}</span>
              <motion.i animate={{ rotate: open === i ? 45 : 0 }}>+</motion.i>
            </button>
            <AnimatePresence initial={false}>
              {open === i && (
                <motion.div
                  className="faq-answer"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                >
                  <p>{item.a}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
