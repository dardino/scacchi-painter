use chess_core::{Move, OrthodoxPosition, Piece, PieceKind};

pub fn format_winning_line_san(start: &OrthodoxPosition, line: &[Move]) -> Vec<String> {
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

pub fn format_winning_line_popeye(start: &OrthodoxPosition, line: &[Move]) -> Vec<String> {
    let mut position = start.clone();
    let mut result = Vec::with_capacity(line.len());

    for (idx, &mv) in line.iter().enumerate() {
        let Some(piece) = position.board.get(mv.from) else {
            break;
        };

        let is_en_passant = piece.kind == PieceKind::Pawn
            && position.en_passant_target == Some(mv.to)
            && mv.from.file != mv.to.file;
        let is_capture = position.board.get(mv.to).is_some() || is_en_passant;
        let move_type = if is_capture { '*' } else { '-' };

        let piece_prefix = match piece.kind {
            PieceKind::King => "K",
            PieceKind::Queen => "Q",
            PieceKind::Rook => "R",
            PieceKind::Bishop => "B",
            PieceKind::Knight => "N",
            PieceKind::Pawn => "",
        };

        let mut effects = String::new();
        if idx == 0 {
            effects.push('!');
        }

        let promotion = if piece.kind == PieceKind::Pawn && (mv.to.rank == 7 || mv.to.rank == 0) {
            "=Q"
        } else {
            ""
        };

        let raw = format!(
            "{piece_prefix}{}{move_type}{}{promotion}",
            format_square(mv.from),
            format_square(mv.to),
        );

        match position.make_move(mv) {
            Ok(next) => {
                if next.is_checkmate() {
                    effects.push('#');
                } else if next.is_in_check(next.side_to_move) {
                    effects.push('+');
                }
                position = next;
            }
            Err(_) => break,
        }

        result.push(format!("{raw}{effects}"));
    }

    result
}

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

fn format_coord(mv: Move) -> String {
    format!("{}{}", format_square(mv.from), format_square(mv.to))
}

fn format_square(square: chess_core::Square) -> String {
    let file = (b'a' + square.file) as char;
    let rank = (b'1' + square.rank) as char;
    format!("{file}{rank}")
}
