import React from 'react';
import { Text, Box } from 'ink';
import AddCommand from './commands/AddCommand';
import ConfigCommand from './commands/ConfigCommand';
import ListCommand from './commands/ListCommand';
import ReviewCommand from './commands/ReviewCommand';
import StatsCommand from './commands/StatsCommand';
import SyncCommand from './commands/SyncCommand';
const App = ({ command, files, direction, target, options }) => {
    const renderCommand = () => {
        switch (command) {
            case 'review': {
                const reviewOptions = options;
                return reviewOptions !== undefined
                    ? React.createElement(ReviewCommand, { options: reviewOptions })
                    : React.createElement(ReviewCommand, null);
            }
            case 'add': {
                const addOptions = options;
                return addOptions !== undefined
                    ? React.createElement(AddCommand, { files: files ?? [], options: addOptions })
                    : React.createElement(AddCommand, { files: files ?? [] });
            }
            case 'stats': {
                const statsOptions = options;
                return statsOptions !== undefined
                    ? React.createElement(StatsCommand, { options: statsOptions })
                    : React.createElement(StatsCommand, null);
            }
            case 'list': {
                const listOptions = options;
                return listOptions !== undefined
                    ? React.createElement(ListCommand, { options: listOptions })
                    : React.createElement(ListCommand, null);
            }
            case 'sync': {
                const syncOptions = options;
                return syncOptions !== undefined
                    ? React.createElement(SyncCommand, { direction: direction ?? '', target: target ?? '', options: syncOptions })
                    : React.createElement(SyncCommand, { direction: direction ?? '', target: target ?? '' });
            }
            case 'config': {
                const configOptions = options;
                return configOptions !== undefined
                    ? React.createElement(ConfigCommand, { options: configOptions })
                    : React.createElement(ConfigCommand, null);
            }
            default: {
                return (React.createElement(Box, { flexDirection: "column" },
                    React.createElement(Text, { color: "red" },
                        "Unknown command: ",
                        command),
                    React.createElement(Text, null, "Run 'coderecall --help' for available commands")));
            }
        }
    };
    return (React.createElement(Box, { flexDirection: "column", padding: 1 },
        React.createElement(Box, { marginBottom: 1 },
            React.createElement(Text, { color: "blue", bold: true }, "CodeRecall CLI")),
        renderCommand()));
};
export default App;
//# sourceMappingURL=App.js.map