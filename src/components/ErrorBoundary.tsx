import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

const RELOAD_KEY = 'ding_err_reload';

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
    // 首次崩溃自动重载一次，消除开发态热更新 / 旧模块残留；再次崩溃则停留并展示原因。
    try {
      const count = Number(sessionStorage.getItem(RELOAD_KEY) || '0');
      if (count < 1) {
        sessionStorage.setItem(RELOAD_KEY, String(count + 1));
        window.location.reload();
      }
    } catch {
      /* 隐私模式下 sessionStorage 不可用，忽略 */
    }
  }

  private hardReload = () => {
    try {
      sessionStorage.removeItem(RELOAD_KEY);
    } catch {
      /* ignore */
    }
    const url = new URL(window.location.href);
    url.searchParams.set('r', String(Date.now()));
    window.location.replace(url.toString());
  };

  public render() {
    if (this.state.hasError) {
      const detail = this.state.error?.message || '未知错误';
      return (
        <div className="min-h-screen bg-[#080808] text-white flex flex-col items-center justify-center p-6 text-center">
          <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mb-6">
            <span className="text-xl">!</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight mb-2">作品集加载中遇到了问题</h1>
          <p className="text-sm text-zinc-400 max-w-md mb-4">
            页面未能正常渲染。点击下方按钮会带上新的版本参数重新加载，绕过浏览器缓存。
          </p>
          <pre className="max-w-lg w-full text-left text-[11px] leading-relaxed text-amber-300/90 bg-white/5 border border-white/10 rounded-xl p-3 mb-6 whitespace-pre-wrap break-all">
            {detail}
          </pre>
          <button
            onClick={this.hardReload}
            className="px-6 py-3 bg-white text-black text-xs font-bold rounded-full uppercase tracking-wider hover:bg-zinc-200 transition-colors cursor-pointer"
          >
            刷新页面 / 重新加载
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
