import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Set defaults in the head for SEO — real title & description.
document.title = "Zodaci · Your Chart, Readings & Printed AstroBook";
const desc = document.querySelector('meta[name="description"]');
if (desc) desc.setAttribute("content",
  "Explore your own calculated birth chart, personal readings and private library, and create a printed AstroBook with Zodaci."
);

const root = document.getElementById('root');
if (root) createRoot(root).render(<App />);
