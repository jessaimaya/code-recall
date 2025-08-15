#!/usr/bin/env node
import React from 'react';
import { render, Box, Text } from 'ink';
const App = () => {
    console.log("holu");
    return (React.createElement(Box, null,
        React.createElement(Text, null, "Hello World!")));
};
const main = () => {
    render(React.createElement(App, null));
};
export default main;
//# sourceMappingURL=index.js.map