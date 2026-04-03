use chess_core::{Piece, PieceKind, Side};

pub fn position_key(pos: &chess_core::OrthodoxPosition) -> String {
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

pub fn board_fen(board: &chess_core::Board) -> String {
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

pub fn castling_rights_fen(cr: chess_core::CastlingRights) -> String {
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
