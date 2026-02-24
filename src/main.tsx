import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { configureStatusBar, hideSplashScreen } from "./lib/native";

// Initialize native features
configureStatusBar();
hideSplashScreen();

createRoot(document.getElementById("root")!).render(<App />);
