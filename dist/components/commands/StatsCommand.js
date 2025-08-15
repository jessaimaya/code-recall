import React, { useState, useEffect } from 'react';
import { Text, Box } from 'ink';
const StatsCommand = ({ options }) => {
    const [stats, setStats] = useState(null);
    useEffect(() => {
        const loadStats = async () => {
            try {
                // TODO: Implement stats logic
                // - Query database for progress statistics
                // - Calculate review streaks, success rates
                // - Format output as table or JSON
                // Placeholder data
                const mockStats = {
                    totalChallenges: 0,
                    dueToday: 0,
                    averageRating: 0,
                    currentStreak: 0,
                    totalReviews: 0
                };
                setStats(mockStats);
            }
            catch (error) {
                console.error('Error loading stats:', error instanceof Error ? error.message : String(error));
            }
        };
        void loadStats();
    }, [options]);
    if (!stats) {
        return React.createElement(Text, null, "Loading statistics...");
    }
    if (options?.format === 'json') {
        return React.createElement(Text, null, JSON.stringify(stats, null, 2));
    }
    return (React.createElement(Box, { flexDirection: "column" },
        React.createElement(Text, { color: "cyan", bold: true }, "\uD83D\uDCCA Progress Statistics"),
        React.createElement(Box, { marginTop: 1 },
            React.createElement(Text, null,
                "Total Challenges: ",
                stats.totalChallenges)),
        React.createElement(Box, null,
            React.createElement(Text, null,
                "Due Today: ",
                stats.dueToday)),
        React.createElement(Box, null,
            React.createElement(Text, null,
                "Current Streak: ",
                stats.currentStreak,
                " days")),
        React.createElement(Box, null,
            React.createElement(Text, null,
                "Total Reviews: ",
                stats.totalReviews)),
        React.createElement(Box, null,
            React.createElement(Text, null,
                "Average Rating: ",
                stats.averageRating.toFixed(1),
                "/4.0"))));
};
export default StatsCommand;
//# sourceMappingURL=StatsCommand.js.map