import { Component, type ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { recoverChunkLoad } from '@/lib/chunkRecovery';

export class PageErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch(error: Error) { recoverChunkLoad(error); }
  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <div role="alert" className="parchment space-y-3 p-6">
        <h1 className="text-2xl">This page couldn't open</h1>
        <p className="text-muted-foreground">Something went wrong while loading it. Please try again.</p>
        <Button onClick={() => { this.setState({ failed: false }); window.location.reload(); }}>Reload page</Button>
      </div>
    );
  }
}
