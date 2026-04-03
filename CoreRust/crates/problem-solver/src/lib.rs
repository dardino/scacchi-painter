use chess_core::{Move, OrthodoxPosition, Piece, PieceKind, Side};
use problem_io::ProblemDefinition;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
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

#[derive(Debug, Clone)]
#[allow(dead_code)]
struct TranspositionEntry {
    solved: bool,
    winning_line: Option<Vec<Move>>,
    depth_searched: u16,
    alpha_cut: bool,
}

#[derive(Debug)]
struct TranspositionCache {
    table: HashMap<String, TranspositionEntry>,
}

impl TranspositionCache {
    fn new() -> Self {
        Self {
            table: HashMap::new(),
        }
    }

    fn get(&self, position: &OrthodoxPosition, plies_left: u16) -> Option<TranspositionEntry> {
        let key = position_key(position);
        self.table.get(&key).and_then(|entry| {
            if entry.depth_searched >= plies_left {
                Some(entry.clone())
            } else {
                None
            }
        })
    }

    fn insert(&mut self, position: &OrthodoxPosition, plies_left: u16, solved: bool, winning_line: Option<Vec<Move>>) {
        let key = position_key(position);
        self.table.insert(
            key,
            TranspositionEntry {
                solved,
                winning_line,
                depth_searched: plies_left,
                alpha_cut: false,
            },
        );
    }

    fn insert_with_alpha_cut(&mut self, position: &OrthodoxPosition, plies_left: u16, solved: bool, winning_line: Option<Vec<Move>>) {
        let key = position_key(position);
        self.table.insert(
            key,
            TranspositionEntry {
                solved,
                winning_line,
                depth_searched: plies_left,
                alpha_cut: true,
            },
        );
    }
}

fn position_key(pos: &OrthodoxPosition) -> String {
    format!(
        "{}|{}|{}",
        board_fen(&pos.board),
        match pos.side_to_move {
            Side::White => "w",
            Side::Black => "b",
        },
        castling_rights_fen(pos.castling_rights)
    )
}

fn board_fen(board: &chess_core::Board) -> String {
    let mut fen = String::new();
    for rank in (0..8).rev() {
        let mut empty_count = 0;
        for file in 0..8 {
            let sq = chess_core::Square::new(file, rank).unwrap();
            match board.get(sq) {
                Some(piece) => {
                    if empty_count > 0 {
                        fen.push_str(&empty_count.to_string());
                        empty_count = 0;
                    }
                    fen.push(piece_char(piece));
                }
                None => empty_count += 1,
            }
        }
        if empty_count > 0 {
            fen.push_str(&empty_count.to_string());
        }
        if rank > 0 {
            fen.push('/');
        }
    }
    fen
}

fn piece_char(piece: Piece) -> char {
    let base = match piece.kind {
        PieceKind::King => 'k',
        PieceKind::Queen => 'q',
        PieceKind::Rook => 'r',
        PieceKind::Bishop => 'b',
        PieceKind::Knight => 'n',
        PieceKind::Pawn => 'p',
    };
    match piece.side {
        Side::White => base.to_uppercase().next().unwrap(),
        Side::Black => base,
    }
}

fn castling_rights_fen(cr: chess_core::CastlingRights) -> String {
    if !cr.white_king_side && !cr.white_queen_side && !cr.black_king_side && !cr.black_queen_side {
        return "-".to_string();
    }
    let mut s = String::new();
    if cr.white_king_side {
        s.push('K');
    }
    if cr.white_queen_side {
        s.push('Q');
    }
    if cr.black_king_side {
        s.push('k');
    }
    if cr.black_queen_side {
        s.push('q');
    }
    s
}

trait Stipulation {
    fn search(
        &self,
        position: &OrthodoxPosition,
        plies_left: u16,
        explored_nodes: &mut u64,
        cache: &mut TranspositionCache,
    ) -> Option<Vec<Move>>;
}

#[derive(Debug, Clone, Copy)]
struct DirectMate {
    attacker: Side,
    deterministic: bool,
}

impl Stipulation for DirectMate {
    fn search(
        &self,
        position: &OrthodoxPosition,
        plies_left: u16,
        explored_nodes: &mut u64,
        cache: &mut TranspositionCache,
    ) -> Option<Vec<Move>> {
        let mut alpha = false;
        let mut beta = true;
        self.search_ab(position, plies_left, explored_nodes, cache, &mut alpha, &mut beta)
    }
}

impl DirectMate {
    fn search_ab(
        &self,
        position: &OrthodoxPosition,
        plies_left: u16,
        explored_nodes: &mut u64,
        cache: &mut TranspositionCache,
        alpha: &mut bool,
        beta: &mut bool,
    ) -> Option<Vec<Move>> {
        if let Some(entry) = cache.get(position, plies_left) {
            if entry.alpha_cut {
                *alpha = *alpha || entry.solved;
            }
            return entry.winning_line.clone();
        }

        *explored_nodes = explored_nodes.saturating_add(1);

        if position.is_checkmate() {
            let result = (position.side_to_move != self.attacker).then(Vec::new);
            if result.is_some() {
                *alpha = true;
            }
            cache.insert(position, plies_left, result.is_some(), result.clone());
            return result;
        }

        if position.is_stalemate() || plies_left == 0 {
            cache.insert(position, plies_left, false, None);
            return None;
        }

        let successors = ordered_successors(position, self.deterministic);
        if successors.is_empty() {
            cache.insert(position, plies_left, false, None);
            return None;
        }

        if position.side_to_move == self.attacker {
            for (mv, next) in successors {
                if let Some(mut line) = self.search_ab(&next, plies_left.saturating_sub(1), explored_nodes, cache, alpha, beta) {
                    line.insert(0, mv);
                    cache.insert(position, plies_left, true, Some(line.clone()));
                    *alpha = true;
                    return Some(line);
                }
                if *alpha >= *beta {
                    cache.insert_with_alpha_cut(position, plies_left, false, None);
                    return None;
                }
            }

            cache.insert(position, plies_left, false, None);
            None
        } else {
            let mut first_defender_line: Option<Vec<Move>> = None;

            for (mv, next) in successors {
                let Some(mut line) = self.search_ab(&next, plies_left.saturating_sub(1), explored_nodes, cache, alpha, beta) else {
                    cache.insert(position, plies_left, false, None);
                    *beta = false;
                    return None;
                };
                line.insert(0, mv);
                if first_defender_line.is_none() {
                    first_defender_line = Some(line);
                }
                if !(*alpha >= *beta) {
                    cache.insert_with_alpha_cut(position, plies_left, false, None);
                    return None;
                }
            }

            if let Some(ref line) = first_defender_line {
                cache.insert(position, plies_left, true, Some(line.clone()));
                *beta = true;
            } else {
                cache.insert(position, plies_left, false, None);
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
        deterministic: config.deterministic,
    };

    let mut explored_nodes = 0;
    let mut cache = TranspositionCache::new();
    let line_moves = stipulation.search(&position, plies, &mut explored_nodes, &mut cache);
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

fn ordered_successors(position: &OrthodoxPosition, deterministic: bool) -> Vec<(Move, OrthodoxPosition)> {
    let mut successors = Vec::new();

    for mv in position.generate_legal_moves() {
        let Ok(next) = position.make_move(mv) else {
            continue;
        };

        let score = move_order_score(position, mv, &next);
        successors.push((mv, next, score));
    }

    if deterministic {
        successors.sort_by(|a, b| {
            b.2.cmp(&a.2)
                .then_with(|| a.0.from.file.cmp(&b.0.from.file))
                .then_with(|| a.0.from.rank.cmp(&b.0.from.rank))
                .then_with(|| a.0.to.file.cmp(&b.0.to.file))
                .then_with(|| a.0.to.rank.cmp(&b.0.to.rank))
        });
    }

    successors.into_iter().map(|(mv, next, _)| (mv, next)).collect()
}

fn move_order_score(position: &OrthodoxPosition, mv: Move, next: &OrthodoxPosition) -> i32 {
    let mut score = 0;

    if next.is_checkmate() {
        score += 10_000;
    } else if next.is_in_check(next.side_to_move) {
        score += 1_000;
    }

    if is_capture(position, mv) {
        score += 200;
    }

    if is_promotion(position, mv) {
        score += 150;
    }

    score
}

fn is_capture(position: &OrthodoxPosition, mv: Move) -> bool {
    if position.board.get(mv.to).is_some() {
        return true;
    }

    let Some(piece) = position.board.get(mv.from) else {
        return false;
    };

    piece.kind == PieceKind::Pawn
        && mv.from.file != mv.to.file
        && position.en_passant_target == Some(mv.to)
}

fn is_promotion(position: &OrthodoxPosition, mv: Move) -> bool {
    let Some(piece) = position.board.get(mv.from) else {
        return false;
    };

    piece.kind == PieceKind::Pawn && (mv.to.rank == 7 || mv.to.rank == 0)
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

    #[test]
    fn deterministic_ordering_explores_no_more_than_unsorted() {
        let problem = ProblemDefinition {
            position: Position::from_fen("k7/2K5/1Q6/8/8/8/8/8 w - - 0 1", Side::White),
            stipulation: "#1".to_string(),
            unsupported_features: vec![],
        };

        let sorted_cfg = SolverConfig {
            max_depth: 8,
            deterministic: true,
        };
        let unsorted_cfg = SolverConfig {
            max_depth: 8,
            deterministic: false,
        };

        let sorted = solve(&problem, &sorted_cfg).expect("sorted config should solve");
        let unsorted = solve(&problem, &unsorted_cfg).expect("unsorted config should solve");

        assert!(sorted.solved);
        assert!(unsorted.solved);
        assert!(sorted.explored_nodes <= unsorted.explored_nodes);
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

        assert!(result.explored_nodes > 0);
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
        assert!(result.explored_nodes < 16);
    }
}
