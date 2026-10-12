import { motion } from "framer-motion";

const container = { hidden: {}, show: { transition: { staggerChildren: 0.04 } } };
const word = {
  hidden: { y: "110%" },
  show: { y: 0, transition: { duration: 0.75, ease: [0.22, 1, 0.36, 1] } },
};

/** Section heading with a masked word-by-word reveal.
 *  The in-view trigger lives on the (unclipped) wrapper, not on the clipped words. */
export default function SectionHeading({ kicker, title }) {
  return (
    <motion.div
      className="how-heading"
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.6 }}
    >
      <motion.span
        className="section-kicker"
        variants={{ hidden: { opacity: 0, x: -12 }, show: { opacity: 1, x: 0, transition: { duration: 0.5 } } }}
      >
        {kicker}
      </motion.span>
      <motion.h2 variants={container}>
        {title.split(" ").map((w, i) => (
          <span className="mask" key={i}>
            <motion.span style={{ display: "inline-block" }} variants={word}>
              {w}&nbsp;
            </motion.span>
          </span>
        ))}
      </motion.h2>
    </motion.div>
  );
}
