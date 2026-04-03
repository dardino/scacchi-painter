use chess_core::{Move, OrthodoxPosition, PieceKind};

pub fn ordered_successors(position: &OrthodoxPosition, deterministic: bool) -> Vec<(Move, OrthodoxPosition)> {
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
