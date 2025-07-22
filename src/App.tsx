import { Suspense } from "react";
import { useRoutes, Routes, Route, BrowserRouter } from "react-router-dom";
import Home from "./components/home";
import routes from "tempo-routes";

function TempoRoutes() {
  return useRoutes(routes);
}

function App() {
  const basename = import.meta.env.BASE_URL;

  return (
    <BrowserRouter basename={basename}>
      <Suspense fallback={<p>Loading...</p>}>
        {import.meta.env.VITE_TEMPO === "true" && <TempoRoutes />}
        <Routes>
          <Route path="/" element={<Home />} />
          {import.meta.env.VITE_TEMPO === "true" && (
            <Route path="/tempobook/*" />
          )}
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
