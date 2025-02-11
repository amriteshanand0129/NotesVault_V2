import "./index.css";
import App from "./App.jsx";
import { createRoot } from "react-dom/client";
import { Auth0Provider } from "@auth0/auth0-react";
import { UserProvider } from "./context/userContext.jsx";
import { BreadcrumbProvider } from "./context/breadcrumbContext.jsx";
import { MessageProvider } from "./context/messageContext";
import MessageBar from "./components/messageBar";

createRoot(document.getElementById("root")).render(
  <Auth0Provider
    domain={import.meta.env.VITE_AUTH0_DOMAIN}
    clientId={import.meta.env.VITE_AUTH0_CLIENT_ID}
    authorizationParams={{
      redirect_uri: window.location.origin,
      audience: import.meta.env.VITE_AUTH0_AUDIENCE,
    }}
  >
    <UserProvider>
      <BreadcrumbProvider>
        <MessageProvider>
          <MessageBar />
          <App />
        </MessageProvider>
      </BreadcrumbProvider>
    </UserProvider>
  </Auth0Provider>
);
