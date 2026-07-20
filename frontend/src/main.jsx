import "./index.css";
import App from "./App.jsx";
import { createRoot } from "react-dom/client";
import { UserProvider } from "./context/userContext.jsx";
import { BreadcrumbProvider } from "./context/breadcrumbContext.jsx";
import { MessageProvider } from "./context/messageContext";
import MessageBar from "./components/messageBar";

createRoot(document.getElementById("root")).render(
  <UserProvider>
    <BreadcrumbProvider>
      <MessageProvider>
        <MessageBar />
        <App />
      </MessageProvider>
    </BreadcrumbProvider>
  </UserProvider>
);
