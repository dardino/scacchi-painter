use serde::{Deserialize, Serialize};
use thiserror::Error;

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum Side {
    White,
    Black,
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

#[derive(Debug, Error)]
pub enum CoreError {
    #[error("invalid position: {0}")]
    InvalidPosition(String),
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
}
