import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout";
import { Home } from "./pages/Home";
import { ServicePage } from "./pages/ServicePage";
import { MetaProvider } from "./contexts/MetaContext";

export function App() {
  return (
    <MetaProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path=":serviceId" element={<ServicePage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </MetaProvider>
  );
}
