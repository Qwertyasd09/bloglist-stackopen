import ReactDOM from "react-dom/client";
import App from "./App";
import { BlogContextProvider } from "./context/BlogListContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")).render(
  <QueryClientProvider client={queryClient}>
    <BlogContextProvider>
      <App />
    </BlogContextProvider>
  </QueryClientProvider>,
);
