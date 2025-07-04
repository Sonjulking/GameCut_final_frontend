import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { Provider } from "react-redux";
import store, { persistor } from "./store/store.js";
import { PersistGate } from "redux-persist/integration/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { GoogleOAuthProvider } from "@react-oauth/google";

const GOOGLE_CLIENT_ID =
  "404116739691-8tlpnbpu5jiev5df6qm0e5jqc3bqdeou.apps.googleusercontent.com";
const queryClient = new QueryClient();

createRoot(document.getElementById("root")).render(
  <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
    <QueryClientProvider client={queryClient}>
      <Provider store={store}>
        <PersistGate
          loading={<div>앱을 불러오는 중...</div>}
          persistor={persistor}
        >
          <App />
        </PersistGate>
      </Provider>
    </QueryClientProvider>
  </GoogleOAuthProvider>
);
