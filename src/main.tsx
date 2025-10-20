import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "./themes.css";
import { ThemeProvider } from "next-themes";

createRoot(document.getElementById("root")!).render(
  <ThemeProvider
    attribute="class"
    defaultTheme="dark"
    enableSystem={false}
    themes={["dark", "light", "blue", "pink", "green", "purple", "white"]}
  >
    <App />
  </ThemeProvider>
);
