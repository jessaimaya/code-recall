#!/usr/bin/env node

import React, { useState } from 'react';
import { render, Box, Text, useInput } from 'ink';

type Screen = 'dashboard' | 'review';

interface AppState {
  currentScreen: Screen;
};


const App: React.FC = () => {
  const [state, setState] = useState<AppState>({ currentScreen: 'dashboard' });

  useInput((input, _key) => {
    if (input !== "d") {
      setState({ currentScreen: 'review' });
    }
  });
  return (
    <Box>
      {state.currentScreen === "dashboard" && <Text>Hello screen!</Text>}
    </Box>
  );
}

render(<App />);

