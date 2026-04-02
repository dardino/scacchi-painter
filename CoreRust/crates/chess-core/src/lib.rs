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

#[derive(Debug, Clone, Copy, PartialEq, Eq, Default)]
pub struct CastlingRights {
    pub white_king_side: bool,
    pub white_queen_side: bool,
    pub black_king_side: bool,
    pub black_queen_side: bool,
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
    pub castling_rights: CastlingRights,
    pub en_passant_target: Option<Square>,
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

        let castling_rights = parse_castling_rights(parts.get(2).copied())?;
        let en_passant_target = parse_en_passant_target(parts.get(3).copied())?;

        Ok(Self {
            board,
            side_to_move,
            castling_rights,
            en_passant_target,
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

    pub fn is_checkmate(&self) -> bool {
        self.is_in_check(self.side_to_move) && self.generate_legal_moves().is_empty()
    }

    pub fn is_stalemate(&self) -> bool {
        !self.is_in_check(self.side_to_move) && self.generate_legal_moves().is_empty()
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
        let mut castling_rights = self.castling_rights;
        let mut en_passant_target = None;

        if moving_piece.kind == PieceKind::Pawn
            && self.board.get(mv.to).is_none()
            && mv.from.file != mv.to.file
            && self.en_passant_target == Some(mv.to)
        {
            let captured_rank = match moving_piece.side {
                Side::White => mv.to.rank.saturating_sub(1),
                Side::Black => mv.to.rank.saturating_add(1),
            };
            let captured_square = Square::new(mv.to.file, captured_rank)?;
            board.set(captured_square, None);
        }

        if moving_piece.kind == PieceKind::King && mv.from.file.abs_diff(mv.to.file) == 2 {
            let (rook_from_file, rook_to_file) = if mv.to.file > mv.from.file {
                (7_u8, 5_u8)
            } else {
                (0_u8, 3_u8)
            };
            let rank = mv.from.rank;
            let rook_from = Square::new(rook_from_file, rank)?;
            let rook_to = Square::new(rook_to_file, rank)?;
            let rook = board.get(rook_from);
            board.set(rook_from, None);
            board.set(rook_to, rook);
        }

        board.set(mv.to, Some(moving_piece));

        if moving_piece.kind == PieceKind::Pawn && mv.from.rank.abs_diff(mv.to.rank) == 2 {
            let mid_rank = (mv.from.rank + mv.to.rank) / 2;
            en_passant_target = Some(Square::new(mv.from.file, mid_rank)?);
        }

        update_castling_rights_after_move(&mut castling_rights, moving_piece, mv);
        if let Some(captured) = self.board.get(mv.to) {
            update_castling_rights_after_capture(&mut castling_rights, captured, mv.to);
        }

        Ok(Self {
            board,
            side_to_move: self.side_to_move.opposite(),
            castling_rights,
            en_passant_target,
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
                PieceKind::Pawn => self.push_pawn_moves(square, piece.side, &mut moves),
                PieceKind::Rook => self.push_sliding_moves(
                    square,
                    piece.side,
                    &[(1, 0), (-1, 0), (0, 1), (0, -1)],
                    &mut moves,
                ),
                PieceKind::Bishop => self.push_sliding_moves(
                    square,
                    piece.side,
                    &[(1, 1), (1, -1), (-1, 1), (-1, -1)],
                    &mut moves,
                ),
                PieceKind::Queen => self.push_sliding_moves(
                    square,
                    piece.side,
                    &[
                        (1, 0),
                        (-1, 0),
                        (0, 1),
                        (0, -1),
                        (1, 1),
                        (1, -1),
                        (-1, 1),
                        (-1, -1),
                    ],
                    &mut moves,
                ),
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

        self.push_castling_moves(from, side, out);
    }

    fn push_castling_moves(&self, from: Square, side: Side, out: &mut Vec<Move>) {
        let (rank, king_side_allowed, queen_side_allowed) = match side {
            Side::White => (
                0_u8,
                self.castling_rights.white_king_side,
                self.castling_rights.white_queen_side,
            ),
            Side::Black => (
                7_u8,
                self.castling_rights.black_king_side,
                self.castling_rights.black_queen_side,
            ),
        };

        if from != Square::new(4, rank).ok().unwrap_or(from) {
            return;
        }

        if self.is_in_check(side) {
            return;
        }

        if king_side_allowed {
            let f = match Square::new(5, rank) {
                Ok(v) => v,
                Err(_) => return,
            };
            let g = match Square::new(6, rank) {
                Ok(v) => v,
                Err(_) => return,
            };
            let rook_square = match Square::new(7, rank) {
                Ok(v) => v,
                Err(_) => return,
            };

            let rook_ok = self.board.get(rook_square)
                == Some(Piece {
                    side,
                    kind: PieceKind::Rook,
                });
            if rook_ok
                && self.board.get(f).is_none()
                && self.board.get(g).is_none()
                && !self.is_square_attacked(f, side.opposite())
                && !self.is_square_attacked(g, side.opposite())
            {
                out.push(Move { from, to: g });
            }
        }

        if queen_side_allowed {
            let b = match Square::new(1, rank) {
                Ok(v) => v,
                Err(_) => return,
            };
            let c = match Square::new(2, rank) {
                Ok(v) => v,
                Err(_) => return,
            };
            let d = match Square::new(3, rank) {
                Ok(v) => v,
                Err(_) => return,
            };
            let rook_square = match Square::new(0, rank) {
                Ok(v) => v,
                Err(_) => return,
            };

            let rook_ok = self.board.get(rook_square)
                == Some(Piece {
                    side,
                    kind: PieceKind::Rook,
                });
            if rook_ok
                && self.board.get(b).is_none()
                && self.board.get(c).is_none()
                && self.board.get(d).is_none()
                && !self.is_square_attacked(c, side.opposite())
                && !self.is_square_attacked(d, side.opposite())
            {
                out.push(Move { from, to: c });
            }
        }
    }

    fn push_pawn_moves(&self, from: Square, side: Side, out: &mut Vec<Move>) {
        let (forward, start_rank): (i8, u8) = match side {
            Side::White => (1, 1),
            Side::Black => (-1, 6),
        };

        if let Some(one_step) = offset_square(from, 0, forward)
            && self.board.get(one_step).is_none()
        {
            out.push(Move { from, to: one_step });

            if from.rank == start_rank
                && let Some(two_step) = offset_square(from, 0, forward * 2)
                && self.board.get(two_step).is_none()
            {
                out.push(Move { from, to: two_step });
            }
        }

        for df in [-1, 1] {
            if let Some(target) = offset_square(from, df, forward)
                && let Some(piece) = self.board.get(target)
                && piece.side != side
            {
                out.push(Move { from, to: target });
            }

            if let Some(target) = offset_square(from, df, forward)
                && self.en_passant_target == Some(target)
            {
                out.push(Move { from, to: target });
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

    fn push_sliding_moves(
        &self,
        from: Square,
        side: Side,
        directions: &[(i8, i8)],
        out: &mut Vec<Move>,
    ) {
        for &(df, dr) in directions {
            let mut current = from;
            while let Some(next) = offset_square(current, df, dr) {
                match self.board.get(next) {
                    None => out.push(Move { from, to: next }),
                    Some(piece) if piece.side != side => {
                        out.push(Move { from, to: next });
                        break;
                    }
                    Some(_) => break,
                }

                current = next;
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
                PieceKind::Pawn => is_pawn_attack(square, target, piece.side),
                PieceKind::Rook => self.can_slide_attack(
                    square,
                    target,
                    &[(1, 0), (-1, 0), (0, 1), (0, -1)],
                ),
                PieceKind::Bishop => self.can_slide_attack(
                    square,
                    target,
                    &[(1, 1), (1, -1), (-1, 1), (-1, -1)],
                ),
                PieceKind::Queen => self.can_slide_attack(
                    square,
                    target,
                    &[
                        (1, 0),
                        (-1, 0),
                        (0, 1),
                        (0, -1),
                        (1, 1),
                        (1, -1),
                        (-1, 1),
                        (-1, -1),
                    ],
                ),
            };

            if attacks {
                return true;
            }
        }

        false
    }

    fn can_slide_attack(&self, from: Square, target: Square, directions: &[(i8, i8)]) -> bool {
        for &(df, dr) in directions {
            let mut current = from;
            while let Some(next) = offset_square(current, df, dr) {
                if next == target {
                    return true;
                }

                if self.board.get(next).is_some() {
                    break;
                }

                current = next;
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

fn is_pawn_attack(from: Square, to: Square, side: Side) -> bool {
    let dr = to.rank as i8 - from.rank as i8;
    let df = (to.file as i8 - from.file as i8).abs();

    match side {
        Side::White => dr == 1 && df == 1,
        Side::Black => dr == -1 && df == 1,
    }
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

fn parse_castling_rights(input: Option<&str>) -> Result<CastlingRights, CoreError> {
    let mut rights = CastlingRights::default();

    let Some(raw) = input else {
        return Ok(rights);
    };

    if raw == "-" {
        return Ok(rights);
    }

    for c in raw.chars() {
        match c {
            'K' => rights.white_king_side = true,
            'Q' => rights.white_queen_side = true,
            'k' => rights.black_king_side = true,
            'q' => rights.black_queen_side = true,
            _ => return Err(CoreError::InvalidFen(raw.to_string())),
        }
    }

    Ok(rights)
}

fn parse_en_passant_target(input: Option<&str>) -> Result<Option<Square>, CoreError> {
    match input {
        Some("-") | None => Ok(None),
        Some(value) => Square::from_algebraic(value).map(Some),
    }
}

fn update_castling_rights_after_move(rights: &mut CastlingRights, piece: Piece, mv: Move) {
    if piece.kind == PieceKind::King {
        match piece.side {
            Side::White => {
                rights.white_king_side = false;
                rights.white_queen_side = false;
            }
            Side::Black => {
                rights.black_king_side = false;
                rights.black_queen_side = false;
            }
        }
    }

    if piece.kind == PieceKind::Rook {
        match (piece.side, mv.from.file, mv.from.rank) {
            (Side::White, 0, 0) => rights.white_queen_side = false,
            (Side::White, 7, 0) => rights.white_king_side = false,
            (Side::Black, 0, 7) => rights.black_queen_side = false,
            (Side::Black, 7, 7) => rights.black_king_side = false,
            _ => {}
        }
    }
}

fn update_castling_rights_after_capture(rights: &mut CastlingRights, captured: Piece, at: Square) {
    if captured.kind != PieceKind::Rook {
        return;
    }

    match (captured.side, at.file, at.rank) {
        (Side::White, 0, 0) => rights.white_queen_side = false,
        (Side::White, 7, 0) => rights.white_king_side = false,
        (Side::Black, 0, 7) => rights.black_queen_side = false,
        (Side::Black, 7, 7) => rights.black_king_side = false,
        _ => {}
    }
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

    #[test]
    fn pseudo_legal_rook_moves_cover_rank_and_file() {
        let position = OrthodoxPosition::from_fen("4k3/8/8/8/3R4/8/8/4K3 w - - 0 1")
            .expect("FEN should parse");
        let d4 = Square::from_algebraic("d4").expect("valid square");

        let pseudo = position.generate_pseudo_legal_moves();
        let rook_moves = pseudo.iter().filter(|m| m.from == d4).count();

        assert_eq!(rook_moves, 14);
    }

    #[test]
    fn is_in_check_detects_bishop_attack() {
        let position = OrthodoxPosition::from_fen("4k3/8/8/8/1b6/8/8/4K3 w - - 0 1")
            .expect("FEN should parse");

        assert!(position.is_in_check(Side::White));
    }

    #[test]
    fn sliding_attack_is_blocked_by_intermediate_piece() {
        let position = OrthodoxPosition::from_fen("k3q3/8/8/8/4N3/8/8/4K3 w - - 0 1")
            .expect("FEN should parse");

        assert!(!position.is_in_check(Side::White));
    }

    #[test]
    fn pseudo_legal_pawn_moves_include_single_and_double_push() {
        let position = OrthodoxPosition::from_fen("4k3/8/8/8/8/8/3P4/4K3 w - - 0 1")
            .expect("FEN should parse");
        let d2 = Square::from_algebraic("d2").expect("valid square");
        let d3 = Square::from_algebraic("d3").expect("valid square");
        let d4 = Square::from_algebraic("d4").expect("valid square");

        let pseudo = position.generate_pseudo_legal_moves();

        assert!(pseudo.iter().any(|m| m.from == d2 && m.to == d3));
        assert!(pseudo.iter().any(|m| m.from == d2 && m.to == d4));
    }

    #[test]
    fn pseudo_legal_pawn_capture_is_generated_diagonally() {
        let position = OrthodoxPosition::from_fen("4k3/8/8/8/8/4p3/3P4/4K3 w - - 0 1")
            .expect("FEN should parse");
        let d2 = Square::from_algebraic("d2").expect("valid square");
        let e3 = Square::from_algebraic("e3").expect("valid square");

        let pseudo = position.generate_pseudo_legal_moves();

        assert!(pseudo.iter().any(|m| m.from == d2 && m.to == e3));
    }

    #[test]
    fn detects_simple_checkmate_position() {
        let position = OrthodoxPosition::from_fen("k7/1Q6/2K5/8/8/8/8/8 b - - 0 1")
            .expect("FEN should parse");

        assert!(position.is_checkmate());
        assert!(!position.is_stalemate());
    }

    #[test]
    fn detects_simple_stalemate_position() {
        let position = OrthodoxPosition::from_fen("k7/2Q5/2K5/8/8/8/8/8 b - - 0 1")
            .expect("FEN should parse");

        assert!(!position.is_checkmate());
        assert!(position.is_stalemate());
    }

    #[test]
    fn king_side_castling_is_generated_when_allowed() {
        let position = OrthodoxPosition::from_fen("4k3/8/8/8/8/8/8/4K2R w K - 0 1")
            .expect("FEN should parse");
        let e1 = Square::from_algebraic("e1").expect("valid square");
        let g1 = Square::from_algebraic("g1").expect("valid square");

        let pseudo = position.generate_pseudo_legal_moves();

        assert!(pseudo.iter().any(|m| m.from == e1 && m.to == g1));
    }

    #[test]
    fn castling_move_repositions_rook() {
        let position = OrthodoxPosition::from_fen("4k3/8/8/8/8/8/8/4K2R w K - 0 1")
            .expect("FEN should parse");
        let e1 = Square::from_algebraic("e1").expect("valid square");
        let g1 = Square::from_algebraic("g1").expect("valid square");
        let f1 = Square::from_algebraic("f1").expect("valid square");
        let h1 = Square::from_algebraic("h1").expect("valid square");

        let next = position
            .make_move(Move { from: e1, to: g1 })
            .expect("castling move should be applicable");

        assert_eq!(next.board.get(g1).map(|p| p.kind), Some(PieceKind::King));
        assert_eq!(next.board.get(f1).map(|p| p.kind), Some(PieceKind::Rook));
        assert!(next.board.get(h1).is_none());
    }

    #[test]
    fn en_passant_target_is_set_after_double_pawn_push() {
        let position = OrthodoxPosition::from_fen("4k3/8/8/8/8/8/3P4/4K3 w - - 0 1")
            .expect("FEN should parse");
        let d2 = Square::from_algebraic("d2").expect("valid square");
        let d4 = Square::from_algebraic("d4").expect("valid square");
        let d3 = Square::from_algebraic("d3").expect("valid square");

        let next = position
            .make_move(Move { from: d2, to: d4 })
            .expect("double pawn push should be valid");

        assert_eq!(next.en_passant_target, Some(d3));
    }

    #[test]
    fn en_passant_capture_is_generated_and_applied() {
        let position = OrthodoxPosition::from_fen("4k3/8/8/3pP3/8/8/8/4K3 w - d6 0 1")
            .expect("FEN should parse");
        let e5 = Square::from_algebraic("e5").expect("valid square");
        let d6 = Square::from_algebraic("d6").expect("valid square");
        let d5 = Square::from_algebraic("d5").expect("valid square");

        let legal = position.generate_legal_moves();
        assert!(legal.iter().any(|m| m.from == e5 && m.to == d6));

        let next = position
            .make_move(Move { from: e5, to: d6 })
            .expect("en-passant should be valid");

        assert_eq!(next.board.get(d6).map(|p| p.kind), Some(PieceKind::Pawn));
        assert!(next.board.get(d5).is_none());
    }
}
