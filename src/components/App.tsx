import React from 'react';
import { Text, Box } from 'ink';

import AddCommand from './commands/AddCommand';
import ConfigCommand from './commands/ConfigCommand';
import ListCommand from './commands/ListCommand';
import ReviewCommand from './commands/ReviewCommand';
import StatsCommand from './commands/StatsCommand';
import SyncCommand from './commands/SyncCommand';

import type { AddOptions, ConfigOptions, ListOptions, ReviewOptions, StatsOptions, SyncOptions } from '../types/index';

interface AppProps {
  readonly command: string;
  readonly files?: readonly string[];
  readonly direction?: string;
  readonly target?: string;
  readonly options?: Readonly<Record<string, unknown>>;
}

const App: React.FC<AppProps> = ({ command, files, direction, target, options }) => {
  const renderCommand = (): React.ReactElement => {
    switch (command) {
      case 'review': {
        const reviewOptions: ReviewOptions | undefined = options as ReviewOptions | undefined;
        return reviewOptions !== undefined 
          ? <ReviewCommand options={reviewOptions} />
          : <ReviewCommand />;
      }
      case 'add': {
        const addOptions: AddOptions | undefined = options as AddOptions | undefined;
        return addOptions !== undefined
          ? <AddCommand files={files ?? []} options={addOptions} />
          : <AddCommand files={files ?? []} />;
      }
      case 'stats': {
        const statsOptions: StatsOptions | undefined = options as StatsOptions | undefined;
        return statsOptions !== undefined
          ? <StatsCommand options={statsOptions} />
          : <StatsCommand />;
      }
      case 'list': {
        const listOptions: ListOptions | undefined = options as ListOptions | undefined;
        return listOptions !== undefined
          ? <ListCommand options={listOptions} />
          : <ListCommand />;
      }
      case 'sync': {
        const syncOptions: SyncOptions | undefined = options as SyncOptions | undefined;
        return syncOptions !== undefined
          ? <SyncCommand direction={direction ?? ''} target={target ?? ''} options={syncOptions} />
          : <SyncCommand direction={direction ?? ''} target={target ?? ''} />;
      }
      case 'config': {
        const configOptions: ConfigOptions | undefined = options as ConfigOptions | undefined;
        return configOptions !== undefined
          ? <ConfigCommand options={configOptions} />
          : <ConfigCommand />;
      }
      default: {
        return (
          <Box flexDirection="column">
            <Text color="red">Unknown command: {command}</Text>
            <Text>Run 'coderecall --help' for available commands</Text>
          </Box>
        );
      }
    }
  };

  return (
    <Box flexDirection="column" padding={1}>
      <Box marginBottom={1}>
        <Text color="blue" bold>CodeRecall CLI</Text>
      </Box>
      {renderCommand()}
    </Box>
  );
};

export default App;