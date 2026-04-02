use chess_core::{Position, Side};
use serde::{Deserialize, Serialize};
use thiserror::Error;

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum DiagnosticLevel {
    Warning,
    Error,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct ParserDiagnostic {
    pub line: usize,
    pub level: DiagnosticLevel,
    pub message: String,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub enum ParsedDirective {
    Stipulation(String),
    Fen(String),
    Unsupported { key: String, value: String },
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PopeyeAst {
    pub directives: Vec<ParsedDirective>,
    pub diagnostics: Vec<ParserDiagnostic>,
    pub stipulation: Option<String>,
    pub fen: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UnsupportedFeature {
    pub directive: String,
    pub detail: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProblemDefinition {
    pub position: Position,
    pub stipulation: String,
    pub unsupported_features: Vec<UnsupportedFeature>,
}

#[derive(Debug, Error)]
pub enum ParseError {
    #[error("empty input")]
    EmptyInput,
    #[error("missing required directive: {0}")]
    MissingRequiredDirective(&'static str),
    #[error("invalid fen: {0}")]
    InvalidFen(String),
}

pub fn parse_popeye(input: &str) -> Result<PopeyeAst, ParseError> {
    if input.trim().is_empty() {
        return Err(ParseError::EmptyInput);
    }

    let mut ast = PopeyeAst {
        directives: Vec::new(),
        diagnostics: Vec::new(),
        stipulation: None,
        fen: None,
    };

    for (idx, raw_line) in input.lines().enumerate() {
        let line_no = idx + 1;
        let line = raw_line.trim();

        if line.is_empty() || line.starts_with(';') || line.starts_with('%') {
            continue;
        }

        if line.eq_ignore_ascii_case("BeginProblem") || line.eq_ignore_ascii_case("EndProblem") {
            continue;
        }

        let Some((raw_key, raw_value)) = split_directive(line) else {
            ast.diagnostics.push(ParserDiagnostic {
                line: line_no,
                level: DiagnosticLevel::Warning,
                message: format!("unrecognized line format: {line}"),
            });
            continue;
        };

        let key = normalize_key(raw_key);
        let value = raw_value.trim().to_string();

        match key.as_str() {
            "stip" | "stipulation" => {
                ast.stipulation = Some(value.clone());
                ast.directives.push(ParsedDirective::Stipulation(value));
            }
            "fen" => {
                ast.fen = Some(value.clone());
                ast.directives.push(ParsedDirective::Fen(value));
            }
            _ => {
                ast.directives.push(ParsedDirective::Unsupported {
                    key: raw_key.to_string(),
                    value: value.clone(),
                });
                ast.diagnostics.push(ParserDiagnostic {
                    line: line_no,
                    level: DiagnosticLevel::Warning,
                    message: format!("unsupported directive: {raw_key}"),
                });
            }
        }
    }

    Ok(ast)
}

pub fn ast_to_problem(ast: PopeyeAst) -> Result<ProblemDefinition, ParseError> {
    let stipulation = ast
        .stipulation
        .ok_or(ParseError::MissingRequiredDirective("stipulation"))?;
    let fen = ast.fen.ok_or(ParseError::MissingRequiredDirective("fen"))?;
    let side = parse_side_from_fen(&fen)?;

    let unsupported_features = ast
        .directives
        .iter()
        .filter_map(|d| match d {
            ParsedDirective::Unsupported { key, value } => Some(UnsupportedFeature {
                directive: key.clone(),
                detail: value.clone(),
            }),
            _ => None,
        })
        .collect();

    Ok(ProblemDefinition {
        position: Position::from_fen(fen, side),
        stipulation,
        unsupported_features,
    })
}

fn parse_side_from_fen(fen: &str) -> Result<Side, ParseError> {
    let side = fen
        .split_whitespace()
        .nth(1)
        .ok_or_else(|| ParseError::InvalidFen(fen.to_string()))?;

    match side {
        "w" => Ok(Side::White),
        "b" => Ok(Side::Black),
        _ => Err(ParseError::InvalidFen(fen.to_string())),
    }
}

fn split_directive(line: &str) -> Option<(&str, &str)> {
    if let Some((k, v)) = line.split_once(':') {
        return Some((k.trim(), v.trim()));
    }

    let mut parts = line.splitn(2, char::is_whitespace);
    let key = parts.next()?.trim();
    let value = parts.next()?.trim();
    if key.is_empty() || value.is_empty() {
        return None;
    }

    Some((key, value))
}

fn normalize_key(input: &str) -> String {
    input.trim().to_ascii_lowercase()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn parse_popeye_rejects_empty_input() {
        let result = parse_popeye("   ");

        assert!(matches!(result, Err(ParseError::EmptyInput)));
    }

    #[test]
    fn parse_popeye_parses_subset_and_keeps_unsupported_directives() {
        let input = r#"
BeginProblem
Stipulation: #2
Fen 4k3/8/8/8/8/8/8/4K3 b - - 0 1
Condition AntiCirce
EndProblem
"#;
        let ast = parse_popeye(input).expect("subset input should parse");

        assert_eq!(ast.stipulation.as_deref(), Some("#2"));
        assert_eq!(
            ast.fen.as_deref(),
            Some("4k3/8/8/8/8/8/8/4K3 b - - 0 1")
        );
        assert!(ast
            .directives
            .iter()
            .any(|d| matches!(d, ParsedDirective::Unsupported { key, .. } if key == "Condition")));
        assert!(ast
            .diagnostics
            .iter()
            .any(|d| d.message.contains("unsupported directive")));
    }

    #[test]
    fn ast_to_problem_maps_position_and_side_from_fen() {
        let ast = PopeyeAst {
            directives: vec![],
            diagnostics: vec![],
            stipulation: Some("#3".to_string()),
            fen: Some("4k3/8/8/8/8/8/8/4K3 b - - 0 1".to_string()),
        };

        let problem = ast_to_problem(ast).expect("mapping should succeed");

        assert_eq!(problem.stipulation, "#3");
        assert_eq!(problem.position.fen, "4k3/8/8/8/8/8/8/4K3 b - - 0 1");
        assert_eq!(problem.position.side_to_move, Side::Black);
    }

    #[test]
    fn ast_to_problem_requires_fen_and_stipulation() {
        let ast = PopeyeAst {
            directives: vec![],
            diagnostics: vec![],
            stipulation: Some("#2".to_string()),
            fen: None,
        };

        let err = ast_to_problem(ast).expect_err("missing fen must fail");
        assert!(matches!(err, ParseError::MissingRequiredDirective("fen")));
    }
}
