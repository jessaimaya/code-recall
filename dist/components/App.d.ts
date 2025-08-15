import React from 'react';
interface AppProps {
    readonly command: string;
    readonly files?: readonly string[];
    readonly direction?: string;
    readonly target?: string;
    readonly options?: Readonly<Record<string, unknown>>;
}
declare const App: React.FC<AppProps>;
export default App;
//# sourceMappingURL=App.d.ts.map