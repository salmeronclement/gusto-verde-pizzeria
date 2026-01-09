import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
                    <div className="bg-white p-8 rounded-lg shadow-xl max-w-lg w-full">
                        <h1 className="text-2xl font-bold text-red-600 mb-4">Une erreur est survenue</h1>
                        <p className="text-gray-600 mb-4">L'application a rencontré un problème inattendu.</p>
                        <div className="bg-gray-100 p-4 rounded overflow-auto mb-6">
                            <code className="text-sm text-red-800">
                                {this.state.error?.toString()}
                            </code>
                        </div>
                        <button
                            onClick={() => {
                                localStorage.clear();
                                window.location.reload();
                            }}
                            className="w-full bg-primary text-white font-bold py-3 rounded-lg hover:bg-secondary transition-colors"
                        >
                            Effacer les données et recharger
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
