import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle } from "lucide-react";

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}

class GlobalErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
        errorInfo: null,
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error, errorInfo: null };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);
        this.setState({ errorInfo });
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="flex h-screen w-screen flex-col items-center justify-center bg-zinc-950 p-6 text-white">
                    <div className="max-w-xl rounded-lg border border-red-500/50 bg-red-950/20 p-8 text-center">
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-900/50">
                            <AlertTriangle className="h-8 w-8 text-red-500" />
                        </div>
                        <h1 className="mb-2 text-2xl font-bold text-red-500">Something went wrong</h1>
                        <p className="mb-6 text-zinc-400">
                            The application crashed due to a runtime error. Please verify the following:
                        </p>

                        <div className="mb-6 overflow-hidden rounded bg-black/50 p-4 text-left font-mono text-xs">
                            <p className="mb-2 text-red-400 font-bold">{this.state.error?.toString()}</p>
                            <pre className="text-zinc-500 whitespace-pre-wrap">
                                {this.state.errorInfo?.componentStack}
                            </pre>
                        </div>

                        <button
                            onClick={() => window.location.reload()}
                            className="rounded bg-red-600 px-4 py-2 font-medium hover:bg-red-700 transition-colors"
                        >
                            Reload Application
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default GlobalErrorBoundary;
