import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import SectionHeading from "./SectionHeading.jsx";

const KEYS = [["accuracy", "Accuracy"], ["precision", "Precision"], ["recall", "Recall"], ["f1", "F1"]];

export default function Metrics() {
  const [data, setData] = useState(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    fetch("/api/metrics")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then(setData)
      .catch(() => setFailed(true));
  }, []);

  const best = data?.models?.find((m) => m.name === data.best_model);

  return (
    <section id="results" className="results-section">
      <SectionHeading kicker="Results" title="Three classifiers, one test set, one winner." />

      {failed && (
        <p className="results-empty">
          Results appear here once the Flask API is running and a model has been trained
          (<code>python train.py</code>).
        </p>
      )}

      {data && (
        <div className="results-wrap">
          {data.is_demo_data && (
            <motion.p className="demo-banner" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
              These numbers come from the bundled <b>synthetic demo dataset</b>. Train on the Kaggle dataset
              (see README) to get figures you can quote in your report.
            </motion.p>
          )}

          <div className="model-grid">
            {data.models.map((m, mi) => (
              <motion.article
                key={m.name}
                className={`model-card ${m.name === data.best_model ? "is-best" : ""}`}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.6, delay: mi * 0.12 }}
                whileHover={{ y: -6 }}
              >
                <header>
                  <h3>{m.name}</h3>
                  {m.name === data.best_model && <span className="best-badge">Best</span>}
                </header>
                {KEYS.map(([k, label]) => (
                  <div className="bar-row" key={k}>
                    <span>{label}</span>
                    <div className="bar-track">
                      <motion.div
                        className="bar-fill"
                        initial={{ width: 0 }}
                        whileInView={{ width: `${m[k] * 100}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, delay: 0.2 + mi * 0.12, ease: "easeOut" }}
                      />
                    </div>
                    <em>{(m[k] * 100).toFixed(1)}%</em>
                  </div>
                ))}
              </motion.article>
            ))}
          </div>

          {best && (
            <motion.div
              className="confusion"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.6 }}
            >
              <div>
                <h3>Confusion matrix — {best.name}</h3>
                <p>
                  Evaluated on {data.test_rows?.toLocaleString()} held-out articles (trained on{" "}
                  {data.train_rows?.toLocaleString()}). The diagonal is what the model got right.
                </p>
              </div>
              <div className="cm">
                <span />
                <span className="cm-h">pred FAKE</span>
                <span className="cm-h">pred REAL</span>
                <span className="cm-h">true FAKE</span>
                <b className="cm-ok">{best.confusion_matrix[0][0]}</b>
                <b className="cm-bad">{best.confusion_matrix[0][1]}</b>
                <span className="cm-h">true REAL</span>
                <b className="cm-bad">{best.confusion_matrix[1][0]}</b>
                <b className="cm-ok">{best.confusion_matrix[1][1]}</b>
              </div>
            </motion.div>
          )}
        </div>
      )}
    </section>
  );
}
