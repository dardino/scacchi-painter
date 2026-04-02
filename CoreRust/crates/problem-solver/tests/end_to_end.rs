use problem_io::{ast_to_problem, parse_popeye, ParseError, PopeyeAst};
use problem_solver::{solve, SolverConfig, SolverError};

#[test]
fn parses_maps_and_solves_mvp_problem() {
    let input = "Stipulation #2\nFEN 8/8/8/8/8/8/8/8 w - - 0 1";
    let ast = parse_popeye(input).expect("MVP parser should accept supported subset");
    let problem = ast_to_problem(ast).expect("mapping should succeed");
    let result = solve(&problem, &SolverConfig::default()).expect("MVP solver should accept # stipulations");

    assert_eq!(problem.stipulation, "#2");
    assert_eq!(problem.position.fen, "8/8/8/8/8/8/8/8 w - - 0 1");
    assert!(!result.solved);
    assert!(result.explored_nodes > 0);
}

#[test]
fn empty_input_fails_before_mapping() {
    let result = parse_popeye("\n\t ");

    assert!(matches!(result, Err(ParseError::EmptyInput)));
}

#[test]
fn unsupported_stipulation_fails_after_mapping() {
    let ast = PopeyeAst {
        directives: vec![],
        diagnostics: vec![],
        stipulation: Some("h#2".to_string()),
        fen: Some("8/8/8/8/8/8/8/8 w - - 0 1".to_string()),
        unsupported_capabilities: vec![],
    };
    let problem = ast_to_problem(ast).expect("mapping should succeed");
    let result = solve(&problem, &SolverConfig::default());

    assert!(matches!(result, Err(SolverError::UnsupportedStipulation(_))));
}
