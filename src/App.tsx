import React, { Suspense, lazy } from "react";
import { useRoutes, Routes, Route, Navigate } from "react-router-dom";
import Home from "./components/home";
import Login from "./components/auth/Login";
import AdminLogin from "./components/auth/AdminLogin";
import Signup from "./components/auth/Signup";
import ForgotPassword from "./components/auth/ForgotPassword";
import ResetPassword from "./components/auth/ResetPassword";
import LetterCreationForm from "./components/LetterCreationForm";
import TrackLetter from "./components/TrackLetter";
import MyLetters from "./components/MyLetters";
import ReplyLetterForm from "./components/ReplyLetterForm";
import ReplyByIdPage from "./pages/ReplyByIdPage";
import LetterRepliesPage from "./pages/LetterRepliesPage";
import Payment from "./pages/Payment";
import Confirmation from "./pages/confirmation";
import NotFound from "./components/NotFound";
import ErrorBoundary from "./components/ErrorBoundary";
import routes from "tempo-routes";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Suspense
          fallback={
            <div className="flex items-center justify-center min-h-screen">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
            </div>
          }
        >
          {/* Tempo routes for storyboards */}
          {import.meta.env.VITE_TEMPO === "true" && useRoutes(routes)}

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
            <Route path="/reply/:id" element={<ReplyLetterForm />} />
            <Route path="/reply" element={<ReplyByIdPage />} />
            <Route
              path="/letter-replies/:id"
              element={
                <ProtectedRoute>
                  <LetterRepliesPage />
                </ProtectedRoute>
              }
            />
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
              path="/admin/user-management"
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
                      lazy(() => import("./pages/admin/user-management")),
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
            <Route
              path="/admin/pricing"
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
                      lazy(() => import("./pages/admin/pricing")),
                    )}
                  </Suspense>
                </AdminRoute>
              }
            />
            {/* Add more protected routes as needed */}

            {/* Tempo routes for storyboards */}
            {import.meta.env.VITE_TEMPO === "true" && (
              <Route path="/tempobook/*" />
            )}

            {/* Catch-all route for 404 pages */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
