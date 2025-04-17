import React, { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "./ui/button";
import { Heart, Home, RefreshCw } from "lucide-react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-gradient-to-b from-pink-50 to-purple-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md text-center">
            <div className="mb-8">
              <Heart className="h-16 w-16 text-rose-400 mx-auto mb-4" />
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                Something went wrong
              </h1>
              <p className="text-gray-600 mb-6">
                We're sorry, but something went wrong. Please try again or
                return to the home page.
              </p>
              <p className="text-gray-500 text-sm mb-6">
                Error: {this.state.error?.message || "Unknown error"}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={() => window.location.reload()}
                variant="outline"
                className="border-rose-300 text-rose-500 hover:bg-rose-50"
              >
                <RefreshCw className="mr-2 h-4 w-4" /> Refresh Page
              </Button>
              <Button
                onClick={() => (window.location.href = "/")}
                className="bg-rose-500 hover:bg-rose-600 text-white w-full sm:w-auto"
              >
                <Home className="mr-2 h-4 w-4" /> Go Home
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
