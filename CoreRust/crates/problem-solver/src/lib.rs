use chess_core::{OrthodoxPosition, Side};
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

trait Stipulation {
    fn can_force(
        &self,
        position: &OrthodoxPosition,
        plies_left: u16,
        explored_nodes: &mut u64,
    ) -> bool;
}

#[derive(Debug, Clone, Copy)]
struct DirectMate {
    attacker: Side,
}

impl Stipulation for DirectMate {
    fn can_force(
        &self,
        position: &OrthodoxPosition,
        plies_left: u16,
        explored_nodes: &mut u64,
    ) -> bool {
        *explored_nodes = explored_nodes.saturating_add(1);

        if position.is_checkmate() {
            return position.side_to_move != self.attacker;
        }

        if position.is_stalemate() || plies_left == 0 {
            return false;
        }

        let legal_moves = position.generate_legal_moves();
        if legal_moves.is_empty() {
            return false;
        }

        if position.side_to_move == self.attacker {
            legal_moves.into_iter().any(|mv| {
                position
                    .make_move(mv)
                    .map(|next| self.can_force(&next, plies_left.saturating_sub(1), explored_nodes))
                    .unwrap_or(false)
            })
        } else {
            legal_moves.into_iter().all(|mv| {
                position
                    .make_move(mv)
                    .map(|next| self.can_force(&next, plies_left.saturating_sub(1), explored_nodes))
                    .unwrap_or(false)
            })
        }
    }
}

#[derive(Debug, Error)]
pub enum SolverError {
    #[error("unsupported stipulation: {0}")]
    UnsupportedStipulation(String),
    #[error("invalid problem position: {0}")]
    InvalidProblemPosition(String),
}

pub fn solve(problem: &ProblemDefinition, config: &SolverConfig) -> Result<SearchResult, SolverError> {
    let mate_moves = parse_directmate_moves(&problem.stipulation)
        .ok_or_else(|| SolverError::UnsupportedStipulation(problem.stipulation.clone()))?;

    let plies = ((mate_moves as u32).saturating_mul(2).saturating_sub(1)) as u16;
    let plies = plies.min(config.max_depth.max(1));
    let position = OrthodoxPosition::from_fen(&problem.position.fen)
        .map_err(|err| SolverError::InvalidProblemPosition(err.to_string()))?;

    let stipulation = DirectMate {
        attacker: position.side_to_move,
    };

    let mut explored_nodes = 0;
    let solved = stipulation.can_force(&position, plies, &mut explored_nodes);

    Ok(SearchResult {
        solved,
        explored_nodes,
    })
}

fn parse_directmate_moves(input: &str) -> Option<u16> {
    let rest = input.trim().strip_prefix('#')?;
    let moves = rest.parse::<u16>().ok()?;
    if moves == 0 {
        return None;
    }

    Some(moves)
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
            unsupported_features: vec![],
        };

        let result = solve(&problem, &SolverConfig::default());

        assert!(matches!(result, Err(SolverError::UnsupportedStipulation(_))));
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
        assert!(result.explored_nodes > 0);
    }

    #[test]
    fn solve_finds_directmate_in_one() {
        let problem = ProblemDefinition {
            position: Position::from_fen("k7/2K5/1Q6/8/8/8/8/8 w - - 0 1", Side::White),
            stipulation: "#1".to_string(),
            unsupported_features: vec![],
        };

        let result = solve(&problem, &SolverConfig::default())
            .expect("#1 position should be evaluated");

        assert!(result.solved);
        assert!(result.explored_nodes > 0);
    }
}
