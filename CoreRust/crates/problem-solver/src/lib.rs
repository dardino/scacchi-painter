use chess_core::{Move, OrthodoxPosition, Piece, PieceKind, Side};
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
    pub winning_line: Vec<String>,
}

trait Stipulation {
    fn search(
        &self,
        position: &OrthodoxPosition,
        plies_left: u16,
        explored_nodes: &mut u64,
    ) -> Option<Vec<Move>>;
}

#[derive(Debug, Clone, Copy)]
struct DirectMate {
    attacker: Side,
}

impl Stipulation for DirectMate {
    fn search(
        &self,
        position: &OrthodoxPosition,
        plies_left: u16,
        explored_nodes: &mut u64,
    ) -> Option<Vec<Move>> {
        *explored_nodes = explored_nodes.saturating_add(1);

        if position.is_checkmate() {
            return (position.side_to_move != self.attacker).then(Vec::new);
        }

        if position.is_stalemate() || plies_left == 0 {
            return None;
        }

        let legal_moves = position.generate_legal_moves();
        if legal_moves.is_empty() {
            return None;
        }

        if position.side_to_move == self.attacker {
            for mv in legal_moves {
                let Ok(next) = position.make_move(mv) else {
                    continue;
                };

                if let Some(mut line) = self.search(&next, plies_left.saturating_sub(1), explored_nodes) {
                    line.insert(0, mv);
                    return Some(line);
                }
            }

            None
        } else {
            let mut first_defender_line: Option<Vec<Move>> = None;

            for mv in legal_moves {
                let Ok(next) = position.make_move(mv) else {
                    return None;
                };

                let Some(mut line) = self.search(&next, plies_left.saturating_sub(1), explored_nodes) else {
                    return None;
                };
                line.insert(0, mv);
                if first_defender_line.is_none() {
                    first_defender_line = Some(line);
                }
            }

            first_defender_line
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
    let line_moves = stipulation.search(&position, plies, &mut explored_nodes);
    let solved = line_moves.is_some();
    let winning_line = match line_moves {
        Some(ref moves) => format_winning_line_san(&position, moves),
        None => vec![],
    };

    Ok(SearchResult {
        solved,
        explored_nodes,
        winning_line,
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

/// Converts a sequence of moves starting from `start` into SAN strings.
fn format_winning_line_san(start: &OrthodoxPosition, line: &[Move]) -> Vec<String> {
    let mut position = start.clone();
    let mut result = Vec::with_capacity(line.len());

    for &mv in line {
        let san = format_move_san(&position, mv);
        match position.make_move(mv) {
            Ok(next) => position = next,
            Err(_) => break,
        }
        result.push(san);
    }

    result
}

/// Formats a single move in Standard Algebraic Notation given the current position.
fn format_move_san(position: &OrthodoxPosition, mv: Move) -> String {
    let Some(piece) = position.board.get(mv.from) else {
        return format_coord(mv);
    };

    // Castling
    if piece.kind == PieceKind::King && mv.from.file.abs_diff(mv.to.file) == 2 {
        let base = if mv.to.file > mv.from.file { "O-O" } else { "O-O-O" };
        let next = position.make_move(mv).ok();
        let suffix = check_suffix(next.as_ref());
        return format!("{base}{suffix}");
    }

    // En passant or normal capture
    let is_en_passant = piece.kind == PieceKind::Pawn
        && position.en_passant_target == Some(mv.to)
        && mv.from.file != mv.to.file;
    let is_capture = position.board.get(mv.to).is_some() || is_en_passant;

    let piece_char = piece_symbol(piece.kind);

    let disambiguation = if piece.kind == PieceKind::Pawn {
        if is_capture {
            format!("{}", (b'a' + mv.from.file) as char)
        } else {
            String::new()
        }
    } else {
        compute_disambiguation(position, mv, piece)
    };

    let capture_str = if is_capture { "x" } else { "" };
    let to_sq = format_square(mv.to);

    // Pawn promotion: auto-queen
    let promo_str = if piece.kind == PieceKind::Pawn && (mv.to.rank == 7 || mv.to.rank == 0) {
        "=Q"
    } else {
        ""
    };

    let next = position.make_move(mv).ok();
    let suffix = check_suffix(next.as_ref());

    format!("{piece_char}{disambiguation}{capture_str}{to_sq}{promo_str}{suffix}")
}

fn piece_symbol(kind: PieceKind) -> &'static str {
    match kind {
        PieceKind::King => "K",
        PieceKind::Queen => "Q",
        PieceKind::Rook => "R",
        PieceKind::Bishop => "B",
        PieceKind::Knight => "N",
        PieceKind::Pawn => "",
    }
}

/// Returns disambiguation string ("", file, rank, or file+rank) for non-pawn moves.
fn compute_disambiguation(position: &OrthodoxPosition, mv: Move, piece: Piece) -> String {
    let ambiguous: Vec<Move> = position
        .generate_legal_moves()
        .into_iter()
        .filter(|&m| {
            m != mv
                && m.to == mv.to
                && position.board.get(m.from).map_or(false, |p| p == piece)
        })
        .collect();

    if ambiguous.is_empty() {
        return String::new();
    }

    let same_file = ambiguous.iter().any(|m| m.from.file == mv.from.file);
    let same_rank = ambiguous.iter().any(|m| m.from.rank == mv.from.rank);

    if !same_file {
        format!("{}", (b'a' + mv.from.file) as char)
    } else if !same_rank {
        format!("{}", (b'1' + mv.from.rank) as char)
    } else {
        format!(
            "{}{}",
            (b'a' + mv.from.file) as char,
            (b'1' + mv.from.rank) as char
        )
    }
}

fn check_suffix(next: Option<&OrthodoxPosition>) -> &'static str {
    match next {
        Some(pos) if pos.is_checkmate() => "#",
        Some(pos) if pos.is_in_check(pos.side_to_move) => "+",
        _ => "",
    }
}

/// Coordinate fallback (e.g. `b6a6`) used when board state is unavailable.
fn format_coord(mv: Move) -> String {
    format!("{}{}", format_square(mv.from), format_square(mv.to))
}

fn format_square(square: chess_core::Square) -> String {
    let file = (b'a' + square.file) as char;
    let rank = (b'1' + square.rank) as char;
    format!("{file}{rank}")
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
        assert!(result.winning_line.is_empty());
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
        assert!(!result.winning_line.is_empty());
        // All these Queen moves from b6 give immediate checkmate in this position.
        // The exact move depends on DFS order; accept any valid mating move.
        assert!(
            ["Qa5#", "Qa6#", "Qa7#", "Qb7#", "Qb8#"]
                .contains(&result.winning_line[0].as_str()),
            "unexpected first move SAN: {}",
            result.winning_line[0]
        );
    }
}
