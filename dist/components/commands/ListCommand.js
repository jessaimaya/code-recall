import React, { useState, useEffect } from 'react';
import { Text, Box } from 'ink';
const ListCommand = ({ options }) => {
    const [challenges, setChallenges] = useState([]);
    useEffect(() => {
        const loadChallenges = async () => {
            try {
                // TODO: Implement list logic
                // - Query database with filters (due, tag, pattern)
                // - Format challenge list with metadata
                // Placeholder data
                const mockChallenges = [];
                setChallenges(mockChallenges);
            }
            catch (error) {
                console.error('Error loading challenges:', error instanceof Error ? error.message : String(error));
            }
        };
        void loadChallenges();
    }, [options]);
    return (React.createElement(Box, { flexDirection: "column" },
        React.createElement(Text, { color: "yellow", bold: true }, "\uD83D\uDCCB Challenge List"),
        challenges.length === 0 ? (React.createElement(Text, null, "No challenges found. Add some with 'coderecall add <file>'")) : (challenges.map((challenge, index) => (React.createElement(Box, { key: index, marginTop: 1 },
            React.createElement(Text, null, challenge.title),
            React.createElement(Text, { color: "gray" },
                " - ",
                challenge.tags?.join(', ')))))),
        options?.due === true && (React.createElement(Text, { color: "gray" }, "Showing only due challenges")),
        options?.tag !== undefined && (React.createElement(Text, { color: "gray" },
            "Filtered by tag: ",
            options.tag)),
        options?.pattern !== undefined && (React.createElement(Text, { color: "gray" },
            "Filtered by pattern: ",
            options.pattern))));
};
export default ListCommand;
//# sourceMappingURL=ListCommand.js.map