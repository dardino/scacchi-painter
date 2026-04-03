use chess_core::{Move, OrthodoxPosition};
use std::collections::HashMap;
use crate::fen;

#[derive(Debug, Clone)]
pub struct TranspositionEntry {
    pub solved: bool,
    pub winning_line: Option<Vec<Move>>,
    pub depth_searched: u16,
    pub alpha_cut: bool,
    pub generation: u32,
}

#[derive(Debug)]
pub struct TranspositionCache {
    pub table: HashMap<String, TranspositionEntry>,
    current_generation: u32,
    ttl_generations: Option<u32>,
}

impl TranspositionCache {
    pub fn new(ttl_generations: Option<u32>) -> Self {
        Self {
            table: HashMap::new(),
            current_generation: 0,
            ttl_generations,
        }
    }

    pub fn advance_generation(&mut self) {
        self.current_generation = self.current_generation.saturating_add(1);
    }

    pub fn get(&mut self, position: &OrthodoxPosition, plies_left: u16) -> Option<TranspositionEntry> {
        let key = fen::position_key(position);
        let entry = self.table.get(&key)?;

        if self.is_expired(entry) {
            self.table.remove(&key);
            return None;
        }

        if entry.depth_searched >= plies_left {
            return Some(entry.clone());
        }

        None
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
                generation: self.current_generation,
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
                generation: self.current_generation,
            },
        );
    }

    fn is_expired(&self, entry: &TranspositionEntry) -> bool {
        let Some(ttl) = self.ttl_generations else {
            return false;
        };

        self.current_generation.saturating_sub(entry.generation) > ttl
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

#[cfg(test)]
mod tests {
    use super::*;
    use chess_core::OrthodoxPosition;

    #[test]
    fn ttl_expires_old_entries() {
        let mut cache = TranspositionCache::new(Some(0));
        let pos = OrthodoxPosition::from_fen("8/8/8/8/8/8/8/K6k w - - 0 1")
            .expect("valid position");

        cache.insert(&pos, 1, true, Some(vec![]));
        assert!(cache.get(&pos, 1).is_some());

        cache.advance_generation();
        assert!(cache.get(&pos, 1).is_none());
    }

    #[test]
    fn ttl_none_keeps_entries_available() {
        let mut cache = TranspositionCache::new(None);
        let pos = OrthodoxPosition::from_fen("8/8/8/8/8/8/8/K6k w - - 0 1")
            .expect("valid position");

        cache.insert(&pos, 1, true, Some(vec![]));
        cache.advance_generation();
        cache.advance_generation();
        cache.advance_generation();

        assert!(cache.get(&pos, 1).is_some());
    }
}
