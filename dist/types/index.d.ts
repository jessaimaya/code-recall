export interface ReviewOptions {
    readonly editor?: string;
    readonly count?: string;
}
export interface AddOptions {
    readonly verify?: boolean;
}
export interface StatsOptions {
    readonly format?: 'table' | 'json';
}
export interface ListOptions {
    readonly due?: boolean;
    readonly tag?: string;
    readonly pattern?: string;
}
export interface SyncOptions {
}
export interface ConfigOptions {
    readonly editor?: string;
    readonly dataDir?: string;
}
export interface BaseCommandProps {
    readonly options?: Readonly<Record<string, unknown>>;
}
export interface Challenge {
    readonly id: string;
    readonly title: string;
    readonly filePath: string;
    readonly author?: string;
    readonly source?: string;
    readonly tags: readonly string[];
    readonly pattern?: string;
    readonly createdAt: Date;
    readonly version: number;
    readonly lastModified: Date;
    readonly contentHash: string;
    readonly content: string;
}
export interface Progress {
    readonly challengeId: string;
    readonly userId: string;
    readonly stability: number;
    readonly difficulty: number;
    readonly easeFactor: number;
    readonly intervalDays: number;
    readonly repetitions: number;
    readonly dueDate: Date;
    readonly lastReviewed?: Date;
    readonly reviewCount: number;
    readonly correctStreak: number;
    readonly totalAttempts: number;
    readonly averageRating?: number;
    readonly createdAt: Date;
    readonly updatedAt: Date;
}
export interface Statistics {
    readonly totalChallenges: number;
    readonly dueToday: number;
    readonly averageRating: number;
    readonly currentStreak: number;
    readonly totalReviews: number;
}
export declare const enum ReviewRating {
    Again = 1,
    Hard = 2,
    Good = 3,
    Easy = 4
}
export interface ReviewRecord {
    readonly challengeId: string;
    readonly userId: string;
    readonly rating: ReviewRating;
    readonly responseTimeMs?: number;
    readonly reviewDate: Date;
    readonly previousInterval: number;
}
//# sourceMappingURL=index.d.ts.map