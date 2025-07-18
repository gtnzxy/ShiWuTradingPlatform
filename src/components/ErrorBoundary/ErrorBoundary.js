import React from 'react';
import { Result, Button } from 'antd';
import { FrownOutlined, ReloadOutlined } from '@ant-design/icons';

/**
 * 全局错误边界组件
 * 捕获React组件树中的JavaScript错误并显示友好的错误UI
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null 
    };
  }

  static getDerivedStateFromError(error) {
    // 更新状态以渲染错误UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // 记录错误详情
    this.setState({
      error: error,
      errorInfo: errorInfo
    });

    // 错误上报
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // 在生产环境中，可以将错误发送到错误监控服务
    if (process.env.NODE_ENV === 'production') {
      // Example: errorReporting.captureException(error, { extra: errorInfo });
    }
  }

  handleReload = () => {
    // 重新加载页面
    window.location.reload();
  };

  handleReset = () => {
    // 重置错误状态
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null 
    });
  };

  render() {
    if (this.state.hasError) {
      const isProductionError = process.env.NODE_ENV === 'production';
      
      return (
        <div style={{ 
          padding: '50px', 
          textAlign: 'center',
          minHeight: '60vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Result
            icon={<FrownOutlined />}
            status="error"
            title="页面出现了错误"
            subTitle={
              isProductionError 
                ? "很抱歉，页面遇到了一些问题。请尝试刷新页面或稍后再试。"
                : `错误详情: ${this.state.error && this.state.error.toString()}`
            }
            extra={[
              <Button 
                type="primary" 
                key="reload"
                icon={<ReloadOutlined />}
                onClick={this.handleReload}
              >
                刷新页面
              </Button>,
              <Button 
                key="reset"
                onClick={this.handleReset}
              >
                重试
              </Button>
            ]}
          >
            {/* 开发环境显示详细错误信息 */}
            {!isProductionError && this.state.errorInfo && (
              <div style={{ 
                textAlign: 'left', 
                marginTop: '20px',
                background: '#f5f5f5',
                padding: '15px',
                borderRadius: '4px',
                fontSize: '12px',
                fontFamily: 'monospace'
              }}>
                <h4>错误堆栈信息：</h4>
                <pre style={{ 
                  whiteSpace: 'pre-wrap',
                  wordWrap: 'break-word',
                  margin: 0
                }}>
                  {this.state.error && this.state.error.stack}
                  {this.state.errorInfo.componentStack}
                </pre>
              </div>
            )}
          </Result>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
