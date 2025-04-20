import React, { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { signIn } from "../../services/auth";
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
import { Mail, Lock, LogIn } from "lucide-react";
import { motion } from "framer-motion";

const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isAdminLogin, setIsAdminLogin] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAdmin } = useAuth();
  const returnUrl = location.state?.returnUrl;

  // Check if we're coming from an admin route
  useEffect(() => {
    const adminPath = location.pathname.startsWith("/admin");
    setIsAdminLogin(adminPath);

    // If user is already logged in and is admin, redirect to admin dashboard
    if (user && isAdmin && adminPath) {
      navigate("/admin");
    }
    // If user is already logged in and not admin but trying to access admin, show error
    else if (user && !isAdmin && adminPath) {
      setError("You do not have admin privileges");
      navigate("/admin/login");
    }
    // If user is already logged in and not on admin path, redirect to home
    else if (user && !adminPath) {
      navigate("/");
    }
    // If trying to access admin path but not logged in, redirect to admin login
    else if (!user && adminPath) {
      navigate("/admin/login");
    }
  }, [user, isAdmin, location.pathname, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { user } = await signIn(email, password);

      // Check if this is an admin login attempt
      if (isAdminLogin) {
        // For admin login attempts, we need to check if they have admin privileges
        if (isAdmin) {
          navigate("/admin", { replace: true });
        } else {
          // If they don't have admin privileges, redirect to admin login with error
          setError("You do not have admin privileges");
          navigate("/admin/login", { replace: true });
          return; // Don't reload the page yet
        }
      } else {
        // Regular user login
        // If there's a returnUrl in the state, navigate there, otherwise go to home
        navigate(returnUrl || "/", { replace: true });
      }

      // Force reload to update UI components that depend on auth state
      window.location.reload();
    } catch (err: any) {
      setError(err.message || "Failed to sign in");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-purple-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="border-none shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-serif text-pink-800 text-center">
              {isAdminLogin ? "Admin Login" : "Welcome Back"}
            </CardTitle>
            <CardDescription className="text-center">
              Sign in to your account to continue
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
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-pink-500" />
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="border-pink-200 focus:border-pink-400 focus:ring-pink-400"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="flex items-center gap-2">
                  <Lock className="h-4 w-4 text-pink-500" />
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="border-pink-200 focus:border-pink-400 focus:ring-pink-400"
                />
              </div>
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white"
              >
                {loading ? (
                  "Signing in..."
                ) : (
                  <>
                    Sign In <LogIn className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <div className="text-sm text-center text-gray-500">
              Don't have an account?{" "}
              <Link
                to="/signup"
                className="text-pink-600 hover:text-pink-800 font-medium"
              >
                Sign up
              </Link>
            </div>
            <div className="text-sm text-center">
              <Link
                to="/forgot-password"
                className="text-pink-600 hover:text-pink-800 font-medium"
              >
                Forgot your password?
              </Link>
            </div>
            <div className="text-xs text-center text-gray-400">
              By signing in, you agree to our Terms of Service and Privacy
              Policy.
            </div>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
};

export default Login;
