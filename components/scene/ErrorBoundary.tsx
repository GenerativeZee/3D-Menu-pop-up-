"use client";

import React from "react";

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onError?: (error: unknown) => void;
}

interface State {
  hasError: boolean;
}

/**
 * Guards the WebGL subtree. Anything that throws while creating the renderer,
 * compiling a shader or parsing a model lands here and the app degrades to the
 * menu / CSS fallback instead of a white screen.
 */
export class SceneErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    this.props.onError?.(error);
    if (process.env.NODE_ENV !== "production") {
      console.warn("[scene] captured error, falling back:", error);
    }
  }

  render() {
    if (this.state.hasError) return this.props.fallback ?? null;
    return this.props.children;
  }
}
