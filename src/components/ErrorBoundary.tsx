import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
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
        <div className="min-h-screen bg-[#080808] text-white flex flex-col items-center justify-center p-6 text-center">
          <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mb-6">
            <span className="text-xl">!</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight mb-2">作品集加载中遇到了问题</h1>
          <p className="text-sm text-zinc-400 max-w-md mb-8">
            页面未能正常渲染，请尝试刷新。如果依然无法显示，请联系设计者。
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-white text-black text-xs font-bold rounded-full uppercase tracking-wider hover:bg-zinc-200 transition-colors"
          >
            刷新页面 / Reload
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
