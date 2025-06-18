import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { Provider } from "react-redux";
import store from "./store/store.js";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { GoogleOAuthProvider } from "@react-oauth/google";

const GOOGLE_CLIENT_ID =
  "404116739691-8tlpnbpu5jiev5df6qm0e5jqc3bqdeou.apps.googleusercontent.com";
const queryClient = new QueryClient();

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <QueryClientProvider client={queryClient}>
        <Provider store={store}>
          <App />{" "}
          {/* BrowserRouter는 AppRoutes가 알아서 RouterProvider로 처리중 */}
        </Provider>
      </QueryClientProvider>
    </GoogleOAuthProvider>
  </StrictMode>
);
