import React, { Suspense, lazy } from "react";
import { useRoutes, Routes, Route } from "react-router-dom";
import Home from "./components/home";
import Login from "./components/auth/Login";
import AdminLogin from "./components/auth/AdminLogin";
import Signup from "./components/auth/Signup";
import ForgotPassword from "./components/auth/ForgotPassword";
import ResetPassword from "./components/auth/ResetPassword";
import LetterCreationForm from "./components/LetterCreationForm";
import TrackLetter from "./components/TrackLetter";
import MyLetters from "./components/MyLetters";
import Payment from "./pages/Payment";
import Confirmation from "./pages/confirmation";
import routes from "tempo-routes";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";

function App() {
  return (
    <AuthProvider>
      <Suspense
        fallback={
          <div className="flex items-center justify-center min-h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
          </div>
        }
      >
        <>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route
              path="/create"
              element={
                <ProtectedRoute>
                  <LetterCreationForm />
                </ProtectedRoute>
              }
            />
            <Route path="/track" element={<TrackLetter />} />
            <Route
              path="/my-letters"
              element={
                <ProtectedRoute>
                  <MyLetters />
                </ProtectedRoute>
              }
            />
            <Route
              path="/payment"
              element={
                <ProtectedRoute>
                  <Payment />
                </ProtectedRoute>
              }
            />
            <Route path="/confirmation" element={<Confirmation />} />

            {/* Admin Routes */}
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <Suspense
                    fallback={
                      <div className="p-8 flex justify-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
                      </div>
                    }
                  >
                    {React.createElement(lazy(() => import("./pages/admin")))}
                  </Suspense>
                </AdminRoute>
              }
            />
            <Route
              path="/admin/letters"
              element={
                <AdminRoute>
                  <Suspense
                    fallback={
                      <div className="p-8 flex justify-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
                      </div>
                    }
                  >
                    {React.createElement(
                      lazy(() => import("./pages/admin/letters")),
                    )}
                  </Suspense>
                </AdminRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <AdminRoute>
                  <Suspense
                    fallback={
                      <div className="p-8 flex justify-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
                      </div>
                    }
                  >
                    {React.createElement(
                      lazy(() => import("./pages/admin/users")),
                    )}
                  </Suspense>
                </AdminRoute>
              }
            />
            <Route
              path="/admin/payments"
              element={
                <AdminRoute>
                  <Suspense
                    fallback={
                      <div className="p-8 flex justify-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
                      </div>
                    }
                  >
                    {React.createElement(
                      lazy(() => import("./pages/admin/payments")),
                    )}
                  </Suspense>
                </AdminRoute>
              }
            />
            <Route
              path="/admin/settings"
              element={
                <AdminRoute>
                  <Suspense
                    fallback={
                      <div className="p-8 flex justify-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
                      </div>
                    }
                  >
                    {React.createElement(
                      lazy(() => import("./pages/admin/settings")),
                    )}
                  </Suspense>
                </AdminRoute>
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
