'use client';

import { Component, ReactNode } from 'react';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: any) {
        console.error("Uncaught error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="fixed inset-0 z-50 bg-black text-red-500 p-8 font-mono overflow-auto">
                    <h1 className="text-xl font-bold mb-4">CRITICAL ERROR</h1>
                    <pre className="whitespace-pre-wrap text-sm">
                        {this.state.error?.toString()}
                    </pre>
                    <pre className="mt-4 text-xs text-zinc-500">
                        {this.state.error?.stack}
                    </pre>
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-8 px-4 py-2 border border-red-500 text-red-500 uppercase"
                    >
                        Reload
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}
