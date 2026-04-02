use problem_io::ProblemDefinition;
use serde::{Deserialize, Serialize};
use thiserror::Error;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SolverConfig {
    pub max_depth: u16,
    pub deterministic: bool,
}

impl Default for SolverConfig {
    fn default() -> Self {
        Self {
            max_depth: 8,
            deterministic: true,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SearchResult {
    pub solved: bool,
    pub explored_nodes: u64,
}

#[derive(Debug, Error)]
pub enum SolverError {
    #[error("unsupported stipulation: {0}")]
    UnsupportedStipulation(String),
}

pub fn solve(problem: &ProblemDefinition, _config: &SolverConfig) -> Result<SearchResult, SolverError> {
    if !problem.stipulation.starts_with('#') {
        return Err(SolverError::UnsupportedStipulation(
            problem.stipulation.clone(),
        ));
    }

    Ok(SearchResult {
        solved: false,
        explored_nodes: 0,
    })
}

#[cfg(test)]
mod tests {
    use super::*;
    use chess_core::{Position, Side};

    #[test]
    fn default_config_is_deterministic() {
        let config = SolverConfig::default();

        assert!(config.deterministic);
        assert_eq!(config.max_depth, 8);
    }

    #[test]
    fn solve_rejects_non_mate_stipulation() {
        let problem = ProblemDefinition {
            position: Position::from_fen("8/8/8/8/8/8/8/8 w - - 0 1", Side::White),
            stipulation: "h#2".to_string(),
        };

        let result = solve(&problem, &SolverConfig::default());

        assert!(matches!(result, Err(SolverError::UnsupportedStipulation(_))));
    }

    #[test]
    fn solve_accepts_mate_stipulation_in_mvp() {
        let problem = ProblemDefinition {
            position: Position::from_fen("8/8/8/8/8/8/8/8 w - - 0 1", Side::White),
            stipulation: "#2".to_string(),
        };

        let result = solve(&problem, &SolverConfig::default()).expect("# stipulation should be accepted");

        assert!(!result.solved);
        assert_eq!(result.explored_nodes, 0);
    }
}
