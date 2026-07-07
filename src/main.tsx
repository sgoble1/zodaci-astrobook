import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Set defaults in the head for SEO — real title & description.
document.title = "April · Complete Birth Chart & Astrological Compendium";
const desc = document.querySelector('meta[name="description"]');
if (desc) desc.setAttribute("content",
  "An interactive, illuminated companion to April's complete birth chart, timeline, retrograde guide and feng shui report — every planet, house, aspect, phase and gua explorable in the style of a Victorian pen-and-ink manuscript."
);

createRoot(document.getElementById("root")!).render(<App />);
