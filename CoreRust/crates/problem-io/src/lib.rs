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
    pub column: usize,
    pub level: DiagnosticLevel,
    pub message: String,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum PopeyeCapability {
    Stipulation,
    Fen,
    Conditions,
    Twins,
    Pieces,
    Options,
    UnknownDirective,
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
    pub unsupported_capabilities: Vec<PopeyeCapability>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UnsupportedFeature {
    pub directive: String,
    pub detail: String,
    pub capability: PopeyeCapability,
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
        unsupported_capabilities: Vec::new(),
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
                column: 1,
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
                let capability = capability_from_directive(&key);
                ast.directives.push(ParsedDirective::Unsupported {
                    key: raw_key.to_string(),
                    value: value.clone(),
                });
                push_capability_if_missing(&mut ast.unsupported_capabilities, capability);
                ast.diagnostics.push(ParserDiagnostic {
                    line: line_no,
                    column: find_column(raw_line, raw_key),
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
                capability: capability_from_directive(&normalize_key(key)),
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

fn capability_from_directive(key: &str) -> PopeyeCapability {
    match key {
        "stip" | "stipulation" => PopeyeCapability::Stipulation,
        "fen" => PopeyeCapability::Fen,
        "condition" | "conditions" => PopeyeCapability::Conditions,
        "twin" | "twins" => PopeyeCapability::Twins,
        "pieces" => PopeyeCapability::Pieces,
        "option" | "options" => PopeyeCapability::Options,
        _ => PopeyeCapability::UnknownDirective,
    }
}

fn push_capability_if_missing(target: &mut Vec<PopeyeCapability>, capability: PopeyeCapability) {
    if !target.contains(&capability) {
        target.push(capability);
    }
}

fn find_column(raw_line: &str, token: &str) -> usize {
    raw_line.find(token).map_or(1, |idx| idx + 1)
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
            .unsupported_capabilities
            .contains(&PopeyeCapability::Conditions));
        assert!(ast
            .diagnostics
            .iter()
            .any(|d| d.message.contains("unsupported directive")));
        let diag = ast
            .diagnostics
            .iter()
            .find(|d| d.message.contains("Condition"))
            .expect("unsupported directive diagnostic should exist");
        assert_eq!(diag.line, 5);
        assert!(diag.column >= 1);
    }

    #[test]
    fn ast_to_problem_maps_position_and_side_from_fen() {
        let ast = PopeyeAst {
            directives: vec![],
            diagnostics: vec![],
            stipulation: Some("#3".to_string()),
            fen: Some("4k3/8/8/8/8/8/8/4K3 b - - 0 1".to_string()),
            unsupported_capabilities: vec![],
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
            unsupported_capabilities: vec![],
        };

        let err = ast_to_problem(ast).expect_err("missing fen must fail");
        assert!(matches!(err, ParseError::MissingRequiredDirective("fen")));
    }

    #[test]
    fn ast_to_problem_preserves_unsupported_feature_capabilities() {
        let ast = PopeyeAst {
            directives: vec![ParsedDirective::Unsupported {
                key: "Condition".to_string(),
                value: "AntiCirce".to_string(),
            }],
            diagnostics: vec![],
            stipulation: Some("#2".to_string()),
            fen: Some("8/8/8/8/8/8/8/8 w - - 0 1".to_string()),
            unsupported_capabilities: vec![PopeyeCapability::Conditions],
        };

        let problem = ast_to_problem(ast).expect("mapping should succeed");
        assert_eq!(problem.unsupported_features.len(), 1);
        assert_eq!(
            problem.unsupported_features[0].capability,
            PopeyeCapability::Conditions
        );
    }
}
