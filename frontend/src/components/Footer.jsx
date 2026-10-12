import { motion } from "framer-motion";
import { scrollToId } from "../hooks/useLenis.js";
import Magnetic from "./Magnetic.jsx";

export default function Footer() {
  return (
    <footer className="site-footer">
      <motion.h2
        className="footer-big"
        initial={{ opacity: 0, y: 60 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
      >
        Read twice.<br /><em>Share once.</em>
      </motion.h2>
      <Magnetic>
        <button className="hero-cta" onClick={() => scrollToId("try-it")}>
          Check another article ↑
        </button>
      </Magnetic>
      <p>The Verification Desk — a college minor project.</p>
      <p className="site-footer-sub">
        TF-IDF features · scikit-learn classifier · served over a Flask API · React front end
      </p>
    </footer>
  );
}
