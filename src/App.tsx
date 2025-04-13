import { Suspense } from "react";
import { useRoutes, Routes, Route } from "react-router-dom";
import Home from "./components/home";
import Login from "./components/auth/Login";
import Signup from "./components/auth/Signup";
import LetterCreationForm from "./components/LetterCreationForm";
import WrittenItems from "./pages/WrittenItems";
import routes from "tempo-routes";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <AuthProvider>
      <Suspense fallback={<p>Loading...</p>}>
        <>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route
              path="/create"
              element={
                <ProtectedRoute>
                  <LetterCreationForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-letters"
              element={
                <ProtectedRoute>
                  <WrittenItems />
                </ProtectedRoute>
              }
            />
            {/* Add more protected routes as needed */}
          </Routes>
          {import.meta.env.VITE_TEMPO === "true" && useRoutes(routes)}
        </>
      </Suspense>
    </AuthProvider>
  );
}

export default App;
