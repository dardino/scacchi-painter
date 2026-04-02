use chess_core::{Position, Side};
use serde::{Deserialize, Serialize};
use thiserror::Error;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PopeyeAst {
    pub stipulation: String,
    pub fen: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProblemDefinition {
    pub position: Position,
    pub stipulation: String,
}

#[derive(Debug, Error)]
pub enum ParseError {
    #[error("unsupported input: {0}")]
    Unsupported(String),
}

pub fn parse_popeye(input: &str) -> Result<PopeyeAst, ParseError> {
    if input.trim().is_empty() {
        return Err(ParseError::Unsupported("empty input".to_string()));
    }

    Ok(PopeyeAst {
        stipulation: "#2".to_string(),
        fen: "8/8/8/8/8/8/8/8 w - - 0 1".to_string(),
    })
}

pub fn ast_to_problem(ast: PopeyeAst) -> ProblemDefinition {
    ProblemDefinition {
        position: Position::from_fen(ast.fen, Side::White),
        stipulation: ast.stipulation,
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn parse_popeye_rejects_empty_input() {
        let result = parse_popeye("   ");

        assert!(matches!(result, Err(ParseError::Unsupported(_))));
    }

    #[test]
    fn parse_popeye_returns_mvp_ast_for_non_empty_input() {
        let ast = parse_popeye("BeginProblem").expect("non-empty input must parse in MVP");

        assert_eq!(ast.stipulation, "#2");
        assert_eq!(ast.fen, "8/8/8/8/8/8/8/8 w - - 0 1");
    }

    #[test]
    fn ast_to_problem_maps_position_and_stipulation() {
        let ast = PopeyeAst {
            stipulation: "#3".to_string(),
            fen: "4k3/8/8/8/8/8/8/4K3 w - - 0 1".to_string(),
        };

        let problem = ast_to_problem(ast);

        assert_eq!(problem.stipulation, "#3");
        assert_eq!(problem.position.fen, "4k3/8/8/8/8/8/8/4K3 w - - 0 1");
        assert_eq!(problem.position.side_to_move, Side::White);
    }
}
