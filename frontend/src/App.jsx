import { useEffect, useState } from "react";
import useLenis from "./hooks/useLenis.js";
import Preloader from "./components/Preloader.jsx";
import Cursor from "./components/Cursor.jsx";
import Navbar from "./components/Navbar.jsx";
import Hero from "./components/Hero.jsx";
import Ticker from "./components/Ticker.jsx";
import Stats from "./components/Stats.jsx";
import HowItWorks from "./components/HowItWorks.jsx";
import Detector from "./components/Detector.jsx";
import Metrics from "./components/Metrics.jsx";
import TechStack from "./components/TechStack.jsx";
import Faq from "./components/Faq.jsx";
import Footer from "./components/Footer.jsx";

export default function App() {
  const [ready, setReady] = useState(false);
  useLenis();

  // lock scroll while the intro curtain is up
  useEffect(() => {
    document.documentElement.style.overflow = ready ? "" : "hidden";
  }, [ready]);

  return (
    <div className="site">
      <div className="grain" aria-hidden="true" />
      <Preloader onDone={() => setReady(true)} />
      <Cursor />
      <Navbar />
      <main>
        <Hero ready={ready} />
        <Ticker />
        <Stats />
        <HowItWorks />
        <Detector />
        <Metrics />
        <TechStack />
        <Faq />
      </main>
      <Footer />
    </div>
  );
}
