import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "../tailwind.css";
import DosusApp from "./DosusApp.jsx";
import { registrarSW } from "../registrarSW.js";

registrarSW();

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <DosusApp />
  </StrictMode>,
);
