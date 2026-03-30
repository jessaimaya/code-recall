/// Convert a test-result pass percentage to an FSRS rating.
///
///  0%        → 1 (Again)  — nothing passed
///  1 – 49%   → 2 (Hard)   — partial, less than half
///  50 – 99%  → 3 (Good)   — majority passed but not perfect
///  100%      → 4 (Easy)   — all tests passed on first attempt
pub fn test_result_to_rating(pass_percent: i32) -> u8 {
    if pass_percent <= 0 {
        1 // Again
    } else if pass_percent < 50 {
        2 // Hard
    } else if pass_percent < 100 {
        3 // Good
    } else {
        4 // Easy
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn zero_percent_is_again() {
        assert_eq!(test_result_to_rating(0), 1);
    }

    #[test]
    fn negative_percent_is_again() {
        assert_eq!(test_result_to_rating(-1), 1);
    }

    #[test]
    fn one_percent_is_hard() {
        assert_eq!(test_result_to_rating(1), 2);
    }

    #[test]
    fn forty_nine_percent_is_hard() {
        assert_eq!(test_result_to_rating(49), 2);
    }

    #[test]
    fn fifty_percent_is_good() {
        assert_eq!(test_result_to_rating(50), 3);
    }

    #[test]
    fn ninety_nine_percent_is_good() {
        assert_eq!(test_result_to_rating(99), 3);
    }

    #[test]
    fn hundred_percent_is_easy() {
        assert_eq!(test_result_to_rating(100), 4);
    }
}
