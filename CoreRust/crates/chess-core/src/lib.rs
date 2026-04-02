use serde::{Deserialize, Serialize};
use thiserror::Error;

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum Side {
    White,
    Black,
}

impl Side {
    pub fn opposite(self) -> Self {
        match self {
            Side::White => Side::Black,
            Side::Black => Side::White,
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct Position {
    pub fen: String,
    pub side_to_move: Side,
}

impl Position {
    pub fn from_fen(fen: impl Into<String>, side_to_move: Side) -> Self {
        Self {
            fen: fen.into(),
            side_to_move,
        }
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum PieceKind {
    King,
    Queen,
    Rook,
    Bishop,
    Knight,
    Pawn,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub struct Piece {
    pub side: Side,
    pub kind: PieceKind,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub struct Square {
    pub file: u8,
    pub rank: u8,
}

impl Square {
    pub fn new(file: u8, rank: u8) -> Result<Self, CoreError> {
        if file > 7 || rank > 7 {
            return Err(CoreError::InvalidSquare(format!(
                "file={file} rank={rank}"
            )));
        }

        Ok(Self { file, rank })
    }

    pub fn from_algebraic(input: &str) -> Result<Self, CoreError> {
        if input.len() != 2 {
            return Err(CoreError::InvalidSquare(input.to_string()));
        }

        let bytes = input.as_bytes();
        let file = bytes[0];
        let rank = bytes[1];

        if !(b'a'..=b'h').contains(&file) || !(b'1'..=b'8').contains(&rank) {
            return Err(CoreError::InvalidSquare(input.to_string()));
        }

        Self::new(file - b'a', rank - b'1')
    }

    pub fn index(self) -> usize {
        (self.rank as usize) * 8 + self.file as usize
    }

    pub fn from_index(index: usize) -> Result<Self, CoreError> {
        if index >= 64 {
            return Err(CoreError::InvalidSquare(format!("index={index}")));
        }

        let file = (index % 8) as u8;
        let rank = (index / 8) as u8;
        Self::new(file, rank)
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub struct Move {
    pub from: Square,
    pub to: Square,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct Board {
    squares: [Option<Piece>; 64],
}

impl Default for Board {
    fn default() -> Self {
        Self::empty()
    }
}

impl Board {
    pub fn empty() -> Self {
        Self {
            squares: [None; 64],
        }
    }

    pub fn get(&self, square: Square) -> Option<Piece> {
        self.squares[square.index()]
    }

    pub fn set(&mut self, square: Square, piece: Option<Piece>) {
        self.squares[square.index()] = piece;
    }

    pub fn piece_count(&self) -> usize {
        self.squares.iter().flatten().count()
    }

    pub fn king_count(&self, side: Side) -> usize {
        self.squares
            .iter()
            .flatten()
            .filter(|p| p.side == side && p.kind == PieceKind::King)
            .count()
    }

    pub fn from_fen_board(input: &str) -> Result<Self, CoreError> {
        let ranks: Vec<&str> = input.split('/').collect();
        if ranks.len() != 8 {
            return Err(CoreError::InvalidFen(input.to_string()));
        }

        let mut board = Board::empty();

        for (fen_rank_idx, rank_text) in ranks.iter().enumerate() {
            let mut file: u8 = 0;
            let board_rank = 7_u8.saturating_sub(fen_rank_idx as u8);

            for c in rank_text.chars() {
                if c.is_ascii_digit() {
                    let skip = c
                        .to_digit(10)
                        .ok_or_else(|| CoreError::InvalidFen(input.to_string()))?
                        as u8;
                    file = file.saturating_add(skip);
                    continue;
                }

                let piece = piece_from_fen_char(c)
                    .ok_or_else(|| CoreError::InvalidFen(input.to_string()))?;
                let square = Square::new(file, board_rank)?;
                board.set(square, Some(piece));
                file = file.saturating_add(1);
            }

            if file != 8 {
                return Err(CoreError::InvalidFen(input.to_string()));
            }
        }

        Ok(board)
    }
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct OrthodoxPosition {
    pub board: Board,
    pub side_to_move: Side,
}

impl OrthodoxPosition {
    pub fn from_fen(input: &str) -> Result<Self, CoreError> {
        let parts: Vec<&str> = input.split_whitespace().collect();
        if parts.len() < 2 {
            return Err(CoreError::InvalidFen(input.to_string()));
        }

        let board = Board::from_fen_board(parts[0])?;
        let side_to_move = match parts[1] {
            "w" => Side::White,
            "b" => Side::Black,
            _ => return Err(CoreError::InvalidFen(input.to_string())),
        };

        Ok(Self {
            board,
            side_to_move,
        })
    }

    pub fn generate_pseudo_legal_moves(&self) -> Vec<Move> {
        self.generate_pseudo_legal_moves_for(self.side_to_move)
    }

    pub fn generate_legal_moves(&self) -> Vec<Move> {
        let side = self.side_to_move;
        self.generate_pseudo_legal_moves()
            .into_iter()
            .filter(|mv| {
                self.make_move(*mv)
                    .map(|next| !next.is_in_check(side))
                    .unwrap_or(false)
            })
            .collect()
    }

    pub fn is_in_check(&self, side: Side) -> bool {
        match self.find_king_square(side) {
            Some(square) => self.is_square_attacked(square, side.opposite()),
            None => false,
        }
    }

    pub fn make_move(&self, mv: Move) -> Result<Self, CoreError> {
        let moving_piece = self
            .board
            .get(mv.from)
            .ok_or_else(|| CoreError::InvalidMove("missing source piece".to_string()))?;

        if moving_piece.side != self.side_to_move {
            return Err(CoreError::InvalidMove(
                "source piece has wrong side".to_string(),
            ));
        }

        if let Some(target_piece) = self.board.get(mv.to)
            && target_piece.side == self.side_to_move
        {
            return Err(CoreError::InvalidMove(
                "cannot capture own piece".to_string(),
            ));
        }

        let mut board = self.board.clone();
        board.set(mv.from, None);
        board.set(mv.to, Some(moving_piece));

        Ok(Self {
            board,
            side_to_move: self.side_to_move.opposite(),
        })
    }

    fn generate_pseudo_legal_moves_for(&self, side: Side) -> Vec<Move> {
        let mut moves = Vec::new();

        for index in 0..64 {
            let square = match Square::from_index(index) {
                Ok(s) => s,
                Err(_) => continue,
            };

            let Some(piece) = self.board.get(square) else {
                continue;
            };

            if piece.side != side {
                continue;
            }

            match piece.kind {
                PieceKind::King => self.push_king_moves(square, piece.side, &mut moves),
                PieceKind::Knight => self.push_knight_moves(square, piece.side, &mut moves),
                _ => {}
            }
        }

        moves
    }

    fn push_king_moves(&self, from: Square, side: Side, out: &mut Vec<Move>) {
        for df in -1..=1 {
            for dr in -1..=1 {
                if df == 0 && dr == 0 {
                    continue;
                }

                if let Some(to) = offset_square(from, df, dr) {
                    self.push_if_target_allowed(from, to, side, out);
                }
            }
        }
    }

    fn push_knight_moves(&self, from: Square, side: Side, out: &mut Vec<Move>) {
        let knight_offsets = [
            (1, 2),
            (2, 1),
            (2, -1),
            (1, -2),
            (-1, -2),
            (-2, -1),
            (-2, 1),
            (-1, 2),
        ];

        for (df, dr) in knight_offsets {
            if let Some(to) = offset_square(from, df, dr) {
                self.push_if_target_allowed(from, to, side, out);
            }
        }
    }

    fn push_if_target_allowed(&self, from: Square, to: Square, side: Side, out: &mut Vec<Move>) {
        let target = self.board.get(to);
        if target.is_none() || target.is_some_and(|p| p.side != side) {
            out.push(Move { from, to });
        }
    }

    fn find_king_square(&self, side: Side) -> Option<Square> {
        for index in 0..64 {
            let square = Square::from_index(index).ok()?;
            if let Some(piece) = self.board.get(square)
                && piece.side == side
                && piece.kind == PieceKind::King
            {
                return Some(square);
            }
        }

        None
    }

    fn is_square_attacked(&self, target: Square, by_side: Side) -> bool {
        for index in 0..64 {
            let square = match Square::from_index(index) {
                Ok(s) => s,
                Err(_) => continue,
            };

            let Some(piece) = self.board.get(square) else {
                continue;
            };

            if piece.side != by_side {
                continue;
            }

            let attacks = match piece.kind {
                PieceKind::King => is_king_attack(square, target),
                PieceKind::Knight => is_knight_attack(square, target),
                _ => false,
            };

            if attacks {
                return true;
            }
        }

        false
    }
}

fn offset_square(from: Square, df: i8, dr: i8) -> Option<Square> {
    let nf = from.file as i8 + df;
    let nr = from.rank as i8 + dr;
    if !(0..=7).contains(&nf) || !(0..=7).contains(&nr) {
        return None;
    }

    Square::new(nf as u8, nr as u8).ok()
}

fn is_king_attack(from: Square, to: Square) -> bool {
    let df = (from.file as i8 - to.file as i8).abs();
    let dr = (from.rank as i8 - to.rank as i8).abs();
    df <= 1 && dr <= 1 && (df != 0 || dr != 0)
}

fn is_knight_attack(from: Square, to: Square) -> bool {
    let df = (from.file as i8 - to.file as i8).abs();
    let dr = (from.rank as i8 - to.rank as i8).abs();
    (df == 1 && dr == 2) || (df == 2 && dr == 1)
}

fn piece_from_fen_char(c: char) -> Option<Piece> {
    let side = if c.is_ascii_uppercase() {
        Side::White
    } else {
        Side::Black
    };

    let kind = match c.to_ascii_lowercase() {
        'k' => PieceKind::King,
        'q' => PieceKind::Queen,
        'r' => PieceKind::Rook,
        'b' => PieceKind::Bishop,
        'n' => PieceKind::Knight,
        'p' => PieceKind::Pawn,
        _ => return None,
    };

    Some(Piece { side, kind })
}

#[derive(Debug, Error)]
pub enum CoreError {
    #[error("invalid position: {0}")]
    InvalidPosition(String),
    #[error("invalid square: {0}")]
    InvalidSquare(String),
    #[error("invalid fen: {0}")]
    InvalidFen(String),
    #[error("invalid move: {0}")]
    InvalidMove(String),
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn from_fen_preserves_fields() {
        let position = Position::from_fen("8/8/8/8/8/8/8/8 w - - 0 1", Side::Black);

        assert_eq!(position.fen, "8/8/8/8/8/8/8/8 w - - 0 1");
        assert_eq!(position.side_to_move, Side::Black);
    }

    #[test]
    fn square_from_algebraic_maps_to_indices() {
        let a1 = Square::from_algebraic("a1").expect("a1 should be valid");
        let h8 = Square::from_algebraic("h8").expect("h8 should be valid");

        assert_eq!(a1.file, 0);
        assert_eq!(a1.rank, 0);
        assert_eq!(a1.index(), 0);
        assert_eq!(h8.file, 7);
        assert_eq!(h8.rank, 7);
        assert_eq!(h8.index(), 63);
    }

    #[test]
    fn board_from_fen_board_places_expected_pieces() {
        let board = Board::from_fen_board("4k3/8/8/8/8/8/8/4K3")
            .expect("FEN board should parse");

        assert_eq!(board.piece_count(), 2);
        assert_eq!(board.king_count(Side::White), 1);
        assert_eq!(board.king_count(Side::Black), 1);
    }

    #[test]
    fn orthodox_position_parses_side_to_move() {
        let position = OrthodoxPosition::from_fen("4k3/8/8/8/8/8/8/4K3 b - - 0 1")
            .expect("FEN should parse");

        assert_eq!(position.side_to_move, Side::Black);
        assert_eq!(position.board.piece_count(), 2);
    }

    #[test]
    fn board_from_fen_rejects_invalid_rank_width() {
        let result = Board::from_fen_board("9/8/8/8/8/8/8/8");

        assert!(matches!(result, Err(CoreError::InvalidFen(_))));
    }

    #[test]
    fn pseudo_legal_moves_include_knight_jumps() {
        let position = OrthodoxPosition::from_fen("4k3/8/8/8/3N4/8/8/4K3 w - - 0 1")
            .expect("FEN should parse");
        let d4 = Square::from_algebraic("d4").expect("valid square");
        let f5 = Square::from_algebraic("f5").expect("valid square");

        let pseudo = position.generate_pseudo_legal_moves();
        let knight_moves = pseudo.iter().filter(|m| m.from == d4).count();

        assert_eq!(knight_moves, 8);
        assert!(pseudo.iter().any(|m| m.from == d4 && m.to == f5));
    }

    #[test]
    fn is_in_check_detects_knight_attack() {
        let position = OrthodoxPosition::from_fen("4k3/8/8/8/8/5n2/8/4K3 w - - 0 1")
            .expect("FEN should parse");

        assert!(position.is_in_check(Side::White));
        assert!(!position.is_in_check(Side::Black));
    }

    #[test]
    fn legal_moves_filter_out_irrelevant_moves_while_in_check() {
        let position = OrthodoxPosition::from_fen("4k3/8/8/8/8/5n2/8/N3K3 w - - 0 1")
            .expect("FEN should parse");
        let a1 = Square::from_algebraic("a1").expect("valid square");

        let pseudo = position.generate_pseudo_legal_moves();
        let legal = position.generate_legal_moves();

        assert!(pseudo.iter().any(|m| m.from == a1));
        assert!(legal.iter().all(|m| m.from != a1));
    }
}
