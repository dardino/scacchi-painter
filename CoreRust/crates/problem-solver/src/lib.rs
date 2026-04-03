// ============================================================================
// Problem-solver: Directmate Chess Problem Solver
// ============================================================================
//
// Module Architecture (6 focused modules):
// - error: Custom error types (SolverError)
// - fen: FEN-based position key generation
// - cache: Transposition table with alpha-beta cutoff tracking
// - moves: Move generation with deterministic ordering
// - san: Standard Algebraic Notation formatting
// - search: DirectMate solver with alpha-beta pruning
//
// Public API: solve(), SolverConfig, SearchResult, SolverError

mod cache;
mod error;
mod fen;
mod moves;
mod san;
mod search;

pub use error::SolverError;
pub use search::{DirectMate, Stipulation};

use chess_core::OrthodoxPosition;
use problem_io::ProblemDefinition;
use serde::{Deserialize, Serialize};
use std::time::{Duration, Instant};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SolverConfig {
    pub max_depth: u16,
    pub deterministic: bool,
    pub max_time_ms: Option<u64>,
    pub transposition_ttl_generations: Option<u32>,
}

impl Default for SolverConfig {
    fn default() -> Self {
        Self {
            max_depth: 8,
            deterministic: true,
            max_time_ms: None,
            transposition_ttl_generations: Some(1),
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SearchResult {
    pub solved: bool,
    pub explored_nodes: u64,
    pub winning_line: Vec<String>,
}

/// Solves a chess problem using the directmate stipulation solver.
pub fn solve(problem: &ProblemDefinition, config: &SolverConfig) -> Result<SearchResult, SolverError> {
    let mate_moves = cache::parse_directmate_moves(&problem.stipulation)
        .ok_or_else(|| SolverError::UnsupportedStipulation(problem.stipulation.clone()))?;

    let plies = ((mate_moves as u32).saturating_mul(2).saturating_sub(1)) as u16;
    let plies = plies.min(config.max_depth.max(1));
    let position = OrthodoxPosition::from_fen(&problem.position.fen)
        .map_err(|err| SolverError::InvalidProblemPosition(err.to_string()))?;

    let stipulation = DirectMate {
        attacker: position.side_to_move,
        deterministic: config.deterministic,
    };

    let mut explored_nodes = 0;
    let mut trans_cache = cache::TranspositionCache::new(config.transposition_ttl_generations);
    let start = Instant::now();
    let deadline = config
        .max_time_ms
        .map(|ms| start + Duration::from_millis(ms));

    let mut line_moves: Option<Vec<chess_core::Move>> = None;
    for depth in 1..=plies {
        if depth > 1 {
            trans_cache.advance_generation();
        }

        let timed = stipulation.search_with_deadline(
            &position,
            depth,
            &mut explored_nodes,
            &mut trans_cache,
            deadline,
        );

        if timed.timed_out {
            break;
        }

        if timed.winning_line.is_some() {
            line_moves = timed.winning_line;
            break;
        }
    }

    let solved = line_moves.is_some();
    let winning_line = match line_moves {
        Some(ref moves) => san::format_winning_line_san(&position, moves),
        None => vec![],
    };

    Ok(SearchResult {
        solved,
        explored_nodes,
        winning_line,
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
        assert_eq!(config.max_depth,8);
    }

    #[test]
    fn solve_rejects_non_mate_stipulation() {
        let problem = ProblemDefinition {
            position: Position::from_fen("8/8/8/8/8/8/8/8 w - - 0 1", Side::White),
            stipulation: "h#2".to_string(),
            unsupported_features: vec![],
        };
        let result = solve(&problem, &SolverConfig::default());
        assert!(matches!(result,Err(SolverError::UnsupportedStipulation(_))));
    }

    #[test]
    fn solve_accepts_mate_stipulation_in_mvp() {
        let problem = ProblemDefinition {
            position: Position::from_fen("8/8/8/8/8/8/8/8 w - - 0 1", Side::White),
            stipulation: "#2".to_string(),
            unsupported_features: vec![],
        };
        let result = solve(&problem, &SolverConfig::default()).expect("# stipulation should be accepted");
        assert!(!result.solved);
        assert!(result.explored_nodes>0);
        assert!(result.winning_line.is_empty());
    }

    #[test]
    fn solve_finds_directmate_in_one() {
        let problem = ProblemDefinition {
            position: Position::from_fen("k7/2K5/1Q6/8/8/8/8/8 w - - 0 1", Side::White),
            stipulation: "#1".to_string(),
            unsupported_features: vec![],
        };
        let result = solve(&problem, &SolverConfig::default()).expect("#1 position should be evaluated");
        assert!(result.solved);
        assert!(result.explored_nodes>0);
        assert!(!result.winning_line.is_empty());
        assert!(
            ["Qa5#", "Qa6#", "Qa7#", "Qb7#", "Qb8#"]
                .contains(&result.winning_line[0].as_str()),
            "unexpected first move SAN: {}",
            result.winning_line[0]
        );
    }

    #[test]
    fn deterministic_ordering_explores_no_more_than_unsorted() {
        let problem = ProblemDefinition {
            position: Position::from_fen("k7/2K5/1Q6/8/8/8/8/8 w - - 0 1", Side::White),
            stipulation: "#1".to_string(),
            unsupported_features: vec![],
        };
        let unsorted_cfg = SolverConfig {
            max_depth: 8,
            deterministic: false,
            max_time_ms: None,
            transposition_ttl_generations: Some(1),
        };
        let sorted_cfg = SolverConfig {
            max_depth: 8,
            deterministic: true,
            max_time_ms: None,
            transposition_ttl_generations: Some(1),
        };
        let sorted = solve(&problem, &sorted_cfg).expect("sorted config should solve");
        let unsorted = solve(&problem, &unsorted_cfg).expect("unsorted config should solve");
        assert!(sorted.solved);
        assert!(unsorted.solved);
        assert!(sorted.explored_nodes<=unsorted.explored_nodes);
    }

    #[test]
    fn solve_respects_zero_time_limit() {
        let problem = ProblemDefinition {
            position: Position::from_fen("k7/2K5/1Q6/8/8/8/8/8 w - - 0 1", Side::White),
            stipulation: "#2".to_string(),
            unsupported_features: vec![],
        };
        let config = SolverConfig {
            max_depth: 8,
            deterministic: true,
            max_time_ms: Some(0),
            transposition_ttl_generations: Some(1),
        };

        let result = solve(&problem, &config).expect("solver should handle zero time budget");

        assert!(!result.solved);
    }

    #[test]
    fn transposition_table_reduces_explored_nodes() {
        let problem = ProblemDefinition {
            position: Position::from_fen("k7/2K5/1Q6/8/8/8/8/8 w - - 0 1", Side::White),
            stipulation: "#2".to_string(),
            unsupported_features: vec![],
        };
        let config = SolverConfig::default();
        let result = solve(&problem, &config).expect("transposition table should work");
        assert!(result.explored_nodes>0);
        assert!(result.solved);
    }

    #[test]
    fn alpha_beta_pruning_reduces_nodes() {
        let problem = ProblemDefinition {
            position: Position::from_fen("k7/2K5/1Q6/8/8/8/8/8 w - - 0 1", Side::White),
            stipulation: "#2".to_string(),
            unsupported_features: vec![],
        };
        let config = SolverConfig::default();
        let result = solve(&problem, &config).expect("alpha-beta should work");
        assert!(result.solved);
        assert!(result.explored_nodes<16);
    }
}
