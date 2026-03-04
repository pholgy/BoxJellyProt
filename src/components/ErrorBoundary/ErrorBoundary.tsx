import React, { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="p-6 bg-gray-50 border border-gray-200 rounded-lg">
          <div className="flex items-center mb-4">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-600" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-600">
                เกิดข้อผิดพลาด
              </h3>
              <div className="mt-2 text-sm text-gray-600">
                <p>ส่วนนี้ไม่สามารถแสดงผลได้ขณะนี้ กรุณาลองรีเฟรชหน้าเว็บ</p>
                {process.env.NODE_ENV === 'development' && this.state.error && (
                  <details className="mt-2">
                    <summary className="cursor-pointer font-medium">รายละเอียดข้อผิดพลาด</summary>
                    <pre className="mt-2 text-xs bg-gray-100 text-gray-700 font-mono p-2 rounded overflow-auto">
                      {this.state.error.message}
                      {this.state.error.stack}
                    </pre>
                  </details>
                )}
              </div>
            </div>
          </div>
          <div className="flex">
            <button
              type="button"
              className="bg-blue-600 px-3 py-2 rounded-md text-sm font-medium text-white hover:bg-blue-700 transition-colors"
              onClick={() => window.location.reload()}
            >
              รีเฟรชหน้าเว็บ
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Database-specific error boundary
export const DatabaseErrorBoundary: React.FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <ErrorBoundary
      fallback={
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-amber-600" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-amber-600">
                ไม่สามารถเชื่อมต่อฐานข้อมูลได้
              </h3>
              <p className="mt-2 text-sm text-gray-600">
                กรุณาตรวจสอบการเชื่อมต่อและลองใหม่อีกครั้ง
              </p>
            </div>
          </div>
        </div>
      }
      onError={(error) => {
        console.error('Database operation failed:', error);
      }}
    >
      {children}
    </ErrorBoundary>
  );
};