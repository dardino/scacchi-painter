use chess_core::{Move, OrthodoxPosition};
use std::collections::HashMap;
use crate::fen;

#[derive(Debug, Clone)]
pub struct TranspositionEntry {
    pub solved: bool,
    pub winning_line: Option<Vec<Move>>,
    pub depth_searched: u16,
    pub alpha_cut: bool,
}

#[derive(Debug)]
pub struct TranspositionCache {
    pub table: HashMap<String, TranspositionEntry>,
}

impl TranspositionCache {
    pub fn new() -> Self {
        Self {
            table: HashMap::new(),
        }
    }

    pub fn get(&self, position: &OrthodoxPosition, plies_left: u16) -> Option<TranspositionEntry> {
        let key = fen::position_key(position);
        self.table.get(&key).and_then(|entry| {
            if entry.depth_searched >= plies_left {
                Some(entry.clone())
            } else {
                None
            }
        })
    }

    pub fn insert(&mut self, position: &OrthodoxPosition, plies_left: u16, solved: bool, winning_line: Option<Vec<Move>>) {
        let key = fen::position_key(position);
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

    pub fn insert_with_alpha_cut(&mut self, position: &OrthodoxPosition, plies_left: u16, solved: bool, winning_line: Option<Vec<Move>>) {
        let key = fen::position_key(position);
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

pub fn parse_directmate_moves(input: &str) -> Option<u16> {
    let rest = input.trim().strip_prefix('#')?;
    let moves = rest.parse::<u16>().ok()?;
    if moves == 0 {
        return None;
    }
    Some(moves)
}
