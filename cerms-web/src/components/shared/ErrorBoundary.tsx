import React, { Component, type ErrorInfo, type ReactNode } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertCircle, RefreshCw, Terminal, ArrowLeft } from "lucide-react"

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error caught by ErrorBoundary:", error, errorInfo)
    this.setState({ errorInfo })
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null })
    window.location.reload()
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-[60vh] items-center justify-center p-4">
          <Card className="w-full max-w-2xl border-none shadow-2xl bg-white dark:bg-slate-900 overflow-hidden rounded-2xl">
            <div className="h-2 bg-destructive w-full" />
            <CardHeader className="space-y-2 pt-6">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
                  <AlertCircle className="size-5" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold tracking-tight">Application Render Crash</CardTitle>
                  <CardDescription className="text-xs">
                    An unexpected runtime exception was intercepted in the component tree.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-xl bg-slate-950 p-4 font-mono text-xs text-rose-400 overflow-x-auto max-h-[300px] whitespace-pre-wrap select-all shadow-inner border border-slate-800">
                <div className="flex items-center gap-2 text-slate-400 font-bold border-b border-slate-800 pb-2 mb-2">
                  <Terminal className="size-4 text-emerald-500" />
                  <span>CRASH TRACE LOG</span>
                </div>
                <strong className="text-red-400 font-bold block mb-1">
                  [{this.state.error?.name}] {this.state.error?.message}
                </strong>
                <span className="text-slate-300 block leading-relaxed">
                  {this.state.error?.stack}
                </span>
                {this.state.errorInfo && (
                  <span className="text-slate-400 block mt-2 pt-2 border-t border-slate-900">
                    Component Stack: {this.state.errorInfo.componentStack}
                  </span>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Button 
                  onClick={this.handleReset}
                  className="flex-1 h-11 text-xs font-bold rounded-xl bg-destructive hover:bg-destructive/95 text-white flex items-center justify-center gap-2 shadow-lg shadow-destructive/20"
                >
                  <RefreshCw className="size-4 animate-spin-hover" /> Clear cache & reload page
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => { window.location.href = "/" }}
                  className="flex-1 h-11 text-xs font-bold rounded-xl border-slate-200 text-slate-700 dark:border-slate-800 dark:text-slate-300 flex items-center justify-center gap-2"
                >
                  <ArrowLeft className="size-4" /> Go back to Main Portal
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}
