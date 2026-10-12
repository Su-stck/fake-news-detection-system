import { useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import SectionHeading from "./SectionHeading.jsx";

const API_URL = import.meta.env.VITE_API_URL || "/api/predict";

const SAMPLES = [
  {
    label: "Try a measured report",
    text: "The finance ministry confirmed on Tuesday that the quarterly inflation figures will be released next week, following a routine review by the central statistics office.",
  },
  {
    label: "Try a sensational claim",
    text: "You won't believe what this one shocking discovery does to your health, doctors are furious and mainstream media refuses to cover it!",
  },
];

function Ring({ value, real }) {
  const r = 46;
  return (
    <svg className="ring" viewBox="0 0 120 120" aria-hidden="true">
      <circle cx="60" cy="60" r={r} className="ring-bg" />
      <motion.circle
        cx="60" cy="60" r={r}
        className={real ? "ring-fg ring-real" : "ring-fg ring-fake"}
        initial={{ pathLength: 0 }}
        animate={{ pathLength: value }}
        transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1], delay: 0.35 }}
      />
    </svg>
  );
}

export default function Detector() {
  const [text, setText] = useState("");
  const [status, setStatus] = useState("idle"); // idle | loading | done | error
  const [result, setResult] = useState(null);
  const [runId, setRunId] = useState(0);
  const [errorMsg, setErrorMsg] = useState("");
  const [history, setHistory] = useState([]);
  const controller = useRef(null);

  async function handleCheck() {
    if (status === "loading") return;
    if (!text.trim()) {
      setErrorMsg("Paste a headline or article first.");
      setStatus("error");
      return;
    }

    controller.current?.abort();
    controller.current = new AbortController();
    setStatus("loading");
    setErrorMsg("");
    setResult(null);

    const started = Date.now();
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
        signal: controller.current.signal,
      });
      const data = await res.json();

      // keep the "reading" animation visible for a beat so it feels deliberate
      const wait = Math.max(0, 900 - (Date.now() - started));
      await new Promise((r) => setTimeout(r, wait));

      if (!res.ok) {
        setErrorMsg(data.error || "Something went wrong reaching the model.");
        setStatus("error");
        return;
      }
      setResult(data);
      setRunId((n) => n + 1);
      setStatus("done");
      setHistory((h) => [{ text, label: data.label, confidence: data.confidence }, ...h].slice(0, 5));
    } catch (err) {
      if (err.name === "AbortError") return;
      setErrorMsg("Couldn't reach the prediction server. Is the Flask API running on port 5000?");
      setStatus("error");
    }
  }

  function loadText(t) {
    setText(t);
    setStatus("idle");
    setResult(null);
    setErrorMsg("");
  }

  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const real = result?.label === "REAL";
  const pct = result?.confidence != null ? Math.round(result.confidence * 100) : null;
  const maxW = result ? Math.max(0.0001, ...result.signals.map((s) => Math.abs(s.weight))) : 1;

  return (
    <section id="try-it" className="try-section">
      <SectionHeading kicker="Try it yourself" title="Paste something real. Paste something suspicious. See what happens." />

      <motion.div
        className="desk-grid"
        initial={{ opacity: 0, y: 48 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.12 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      >
        <section className="paper" aria-label="Article input">
          {status === "loading" && <span className="scan-line" />}
          <label className="paper-label" htmlFor="article-text">
            Article or headline text
          </label>
          <textarea
            id="article-text"
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              if (status !== "loading") setStatus("idle");
            }}
            onKeyDown={(e) => (e.ctrlKey || e.metaKey) && e.key === "Enter" && handleCheck()}
            placeholder="Paste the full headline or a few sentences of the article here…"
            rows={11}
          />
          <div className="paper-footer">
            <span className="word-count">
              {wordCount} {wordCount === 1 ? "word" : "words"} · Ctrl+Enter to submit
            </span>
            <div className="samples">
              {SAMPLES.map((s) => (
                <button key={s.label} type="button" className="sample-btn" onClick={() => loadText(s.text)}>
                  {s.label}
                </button>
              ))}
              {text && (
                <button type="button" className="sample-btn" onClick={() => loadText("")}>
                  Clear
                </button>
              )}
            </div>
          </div>

          <button className="check-btn" onClick={handleCheck} disabled={status === "loading"}>
            {status === "loading" ? "Reading…" : "Render a verdict"}
          </button>

          <AnimatePresence>
            {status === "error" && (
              <motion.p
                className="error-note"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
              >
                {errorMsg}
              </motion.p>
            )}
          </AnimatePresence>
        </section>

        <section className="verdict-panel" aria-live="polite">
          <AnimatePresence mode="wait">
            {status === "loading" && (
              <motion.div key="loading" className="verdict-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div className="dots"><i /><i /><i /></div>
                <p className="stamp-placeholder stamp-loading">Cross-checking word patterns…</p>
              </motion.div>
            )}

            {status !== "loading" && !result && (
              <motion.div key="idle" className="verdict-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <p className="stamp-placeholder">A verdict will be stamped here once you submit an article.</p>
              </motion.div>
            )}

            {result && (
              <motion.div
                key={runId}
                className="result"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, x: [0, -7, 7, -4, 3, 0] }}
                transition={{ opacity: { duration: 0.2 }, x: { delay: 0.3, duration: 0.4 } }}
              >
                <div className="stamp-zone">
                  <motion.div
                    className={`stamp ${real ? "stamp-real" : "stamp-fake"}`}
                    initial={{ scale: 2.8, rotate: -24, opacity: 0 }}
                    animate={{ scale: 1, rotate: -6, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 480, damping: 15, delay: 0.1 }}
                  >
                    {result.label}
                  </motion.div>
                  <motion.span
                    className={`impact ${real ? "impact-real" : "impact-fake"}`}
                    initial={{ scale: 0.6, opacity: 0.7 }}
                    animate={{ scale: 2.4, opacity: 0 }}
                    transition={{ delay: 0.28, duration: 0.7 }}
                  />
                </div>

                {pct != null && (
                  <div className="confidence-readout">
                    <div className="ring-wrap">
                      <Ring value={result.confidence} real={real} />
                      <span className="ring-num">{pct}%</span>
                    </div>
                    <div className="prob-bars">
                      {["REAL", "FAKE"].map((k) => (
                        <div className="prob-row" key={k}>
                          <span>{k}</span>
                          <div className="confidence-bar">
                            <motion.div
                              className={`confidence-fill ${k === "REAL" ? "fill-real" : "fill-fake"}`}
                              initial={{ width: 0 }}
                              animate={{ width: `${Math.round((result.probabilities?.[k] ?? 0) * 100)}%` }}
                              transition={{ duration: 0.9, delay: 0.4, ease: "easeOut" }}
                            />
                          </div>
                          <em>{Math.round((result.probabilities?.[k] ?? 0) * 100)}%</em>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {result.signals?.length > 0 && (
                  <div className="signals">
                    <h4>Words that tipped the decision</h4>
                    <div className="signal-list">
                      {result.signals.map((s, i) => (
                        <motion.div
                          key={s.word}
                          className={`signal ${s.direction === "REAL" ? "signal-real" : "signal-fake"}`}
                          initial={{ opacity: 0, x: -14 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.5 + i * 0.06 }}
                          title={`Pushes toward ${s.direction}`}
                        >
                          <span>{s.word}</span>
                          <i style={{ width: `${Math.max(12, (Math.abs(s.weight) / maxW) * 100)}%` }} />
                        </motion.div>
                      ))}
                    </div>
                    <p className="signal-key"><b className="k-real" /> toward REAL <b className="k-fake" /> toward FAKE</p>
                  </div>
                )}

                <p className="confidence-caveat">
                  A statistical estimate from a college minor project — not a certified fact-check.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </motion.div>

      <AnimatePresence>
        {history.length > 0 && (
          <motion.div className="history" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <h4>Recent checks</h4>
            <ul>
              {history.map((h, i) => (
                <motion.li key={h.text + i} layout initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
                  <button onClick={() => loadText(h.text)}>
                    <span className={h.label === "REAL" ? "h-real" : "h-fake"}>{h.label}</span>
                    <span className="h-text">{h.text}</span>
                    {h.confidence != null && <em>{Math.round(h.confidence * 100)}%</em>}
                  </button>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
