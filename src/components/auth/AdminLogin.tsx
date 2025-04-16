import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signInAdmin } from "../../services/auth";
import { useAuth } from "../../contexts/AuthContext";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { User, Lock, LogIn, Shield } from "lucide-react";
import { motion } from "framer-motion";

const AdminLogin: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();

  // If already logged in as admin, redirect to admin dashboard
  React.useEffect(() => {
    if (user && isAdmin) {
      navigate("/admin");
    }
  }, [user, isAdmin, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const success = await signInAdmin(username, password);
      if (success) {
        // Set admin status in session storage before navigating
        sessionStorage.setItem("adminSession", "true");
        localStorage.setItem("isAdmin", "true");

        // Force reload first to update auth state
        window.location.href = "/admin";
      } else {
        setError("Invalid admin credentials");
      }
    } catch (err: any) {
      setError(err.message || "Failed to sign in as admin");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-indigo-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="border-none shadow-lg">
          <CardHeader className="space-y-1">
            <div className="flex justify-center mb-2">
              <Shield className="h-12 w-12 text-purple-600" />
            </div>
            <CardTitle className="text-2xl font-serif text-purple-800 text-center">
              Admin Access
            </CardTitle>
            <CardDescription className="text-center">
              Sign in with your administrator credentials
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="bg-red-50 text-red-500 p-3 rounded-md mb-4 text-sm">
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username" className="flex items-center gap-2">
                  <User className="h-4 w-4 text-purple-500" />
                  Username
                </Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Admin username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="border-purple-200 focus:border-purple-400 focus:ring-purple-400"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="flex items-center gap-2">
                  <Lock className="h-4 w-4 text-purple-500" />
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="border-purple-200 focus:border-purple-400 focus:ring-purple-400"
                />
              </div>
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white"
              >
                {loading ? (
                  "Signing in..."
                ) : (
                  <>
                    Admin Sign In <LogIn className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center">
            <div className="text-sm text-center text-gray-500">
              <a
                href="/login"
                className="text-purple-600 hover:text-purple-800 font-medium"
              >
                Return to regular login
              </a>
            </div>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
};

export default AdminLogin;
