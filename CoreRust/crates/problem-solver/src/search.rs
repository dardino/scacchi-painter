use chess_core::{Move, OrthodoxPosition, Side};
use crate::cache::TranspositionCache;
use crate::moves;
use std::time::Instant;

#[derive(Debug, Clone)]
pub struct TimedSearchResult {
    pub winning_line: Option<Vec<Move>>,
    pub timed_out: bool,
}

enum SearchState {
    Completed(Option<Vec<Move>>),
    TimedOut,
}

pub trait Stipulation {
    fn search(
        &self,
        position: &OrthodoxPosition,
        plies_left: u16,
        explored_nodes: &mut u64,
        cache: &mut TranspositionCache,
    ) -> Option<Vec<Move>>;
}

#[derive(Debug, Clone, Copy)]
pub struct DirectMate {
    pub attacker: Side,
    pub deterministic: bool,
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
    pub fn search_with_deadline(
        &self,
        position: &OrthodoxPosition,
        plies_left: u16,
        explored_nodes: &mut u64,
        cache: &mut TranspositionCache,
        deadline: Option<Instant>,
    ) -> TimedSearchResult {
        let mut alpha = false;
        let mut beta = true;
        match self.search_ab_with_deadline(
            position,
            plies_left,
            explored_nodes,
            cache,
            &mut alpha,
            &mut beta,
            deadline,
        ) {
            SearchState::Completed(winning_line) => TimedSearchResult {
                winning_line,
                timed_out: false,
            },
            SearchState::TimedOut => TimedSearchResult {
                winning_line: None,
                timed_out: true,
            },
        }
    }

    pub fn search_ab(
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

        let successors = moves::ordered_successors(position, self.deterministic);
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

    fn search_ab_with_deadline(
        &self,
        position: &OrthodoxPosition,
        plies_left: u16,
        explored_nodes: &mut u64,
        cache: &mut TranspositionCache,
        alpha: &mut bool,
        beta: &mut bool,
        deadline: Option<Instant>,
    ) -> SearchState {
        if let Some(limit) = deadline {
            if Instant::now() >= limit {
                return SearchState::TimedOut;
            }
        }

        if let Some(entry) = cache.get(position, plies_left) {
            if entry.alpha_cut {
                *alpha = *alpha || entry.solved;
            }
            return SearchState::Completed(entry.winning_line.clone());
        }

        *explored_nodes = explored_nodes.saturating_add(1);

        if position.is_checkmate() {
            let result = (position.side_to_move != self.attacker).then(Vec::new);
            if result.is_some() {
                *alpha = true;
            }
            cache.insert(position, plies_left, result.is_some(), result.clone());
            return SearchState::Completed(result);
        }

        if position.is_stalemate() || plies_left == 0 {
            cache.insert(position, plies_left, false, None);
            return SearchState::Completed(None);
        }

        let successors = moves::ordered_successors(position, self.deterministic);
        if successors.is_empty() {
            cache.insert(position, plies_left, false, None);
            return SearchState::Completed(None);
        }

        if position.side_to_move == self.attacker {
            for (mv, next) in successors {
                let child_state = self.search_ab_with_deadline(
                    &next,
                    plies_left.saturating_sub(1),
                    explored_nodes,
                    cache,
                    alpha,
                    beta,
                    deadline,
                );

                match child_state {
                    SearchState::TimedOut => return SearchState::TimedOut,
                    SearchState::Completed(Some(mut line)) => {
                        line.insert(0, mv);
                        cache.insert(position, plies_left, true, Some(line.clone()));
                        *alpha = true;
                        return SearchState::Completed(Some(line));
                    }
                    SearchState::Completed(None) => {}
                }

                if *alpha >= *beta {
                    cache.insert_with_alpha_cut(position, plies_left, false, None);
                    return SearchState::Completed(None);
                }
            }

            cache.insert(position, plies_left, false, None);
            SearchState::Completed(None)
        } else {
            let mut first_defender_line: Option<Vec<Move>> = None;

            for (mv, next) in successors {
                let child_state = self.search_ab_with_deadline(
                    &next,
                    plies_left.saturating_sub(1),
                    explored_nodes,
                    cache,
                    alpha,
                    beta,
                    deadline,
                );

                let mut line = match child_state {
                    SearchState::TimedOut => return SearchState::TimedOut,
                    SearchState::Completed(Some(line)) => line,
                    SearchState::Completed(None) => {
                        cache.insert(position, plies_left, false, None);
                        *beta = false;
                        return SearchState::Completed(None);
                    }
                };

                line.insert(0, mv);
                if first_defender_line.is_none() {
                    first_defender_line = Some(line);
                }

                if !(*alpha >= *beta) {
                    cache.insert_with_alpha_cut(position, plies_left, false, None);
                    return SearchState::Completed(None);
                }
            }

            if let Some(ref line) = first_defender_line {
                cache.insert(position, plies_left, true, Some(line.clone()));
                *beta = true;
            } else {
                cache.insert(position, plies_left, false, None);
            }

            SearchState::Completed(first_defender_line)
        }
    }
}
