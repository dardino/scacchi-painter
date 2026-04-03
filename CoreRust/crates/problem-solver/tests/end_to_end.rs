use problem_io::{ast_to_problem, parse_popeye, ParseError, PopeyeAst};
use problem_solver::{solve, solve_streaming, SolverConfig, SolverError, StreamDirective};

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
    assert!(result.winning_line.is_empty());
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

/// Full pipeline: Popeye format input → parse → map → solve for a mate-in-2 position.
/// FEN: 7n/3NR3/1P3p2/1p1kbN1B/1p6/1K6/6b1/1Q6 w - - 0 1
/// Expected key move: Qf1 (Qb1-f1 in Popeye notation)
#[test]
fn pipeline_solves_mate_in_two_with_colon_syntax() {
    let input = "Stipulation: #2\nFEN: 7n/3NR3/1P3p2/1p1kbN1B/1p6/1K6/6b1/1Q6 w - - 0 1";
    let ast = parse_popeye(input).expect("colon-syntax Popeye input should parse");
    let problem = ast_to_problem(ast).expect("problem mapping should succeed");
    let result = solve(&problem, &SolverConfig::default()).expect("#2 should be accepted");

    assert!(result.solved, "position should have a directmate in 2 solution");
    assert_eq!(result.winning_line, vec!["Qf1", "Bxf1", "Bf3#"]);
}

/// Full pipeline: Popeye format input → parse → map → solve for a mate-in-3 position.
/// FEN: b7/2K5/2n5/p1kB1p2/P1p5/3Rp3/2NN4/4B3 w - - 0 1
/// Expected key move: Be6 (Bd5-e6 in Popeye notation)
#[test]
fn pipeline_solves_mate_in_three_with_colon_syntax() {
    let input = "Stipulation: #3\nFEN: b7/2K5/2n5/p1kB1p2/P1p5/3Rp3/2NN4/4B3 w - - 0 1";
    let ast = parse_popeye(input).expect("colon-syntax Popeye input should parse");
    let problem = ast_to_problem(ast).expect("problem mapping should succeed");
    let result = solve(&problem, &SolverConfig::default()).expect("#3 should be accepted");

    assert!(result.solved, "position should have a directmate in 3 solution");
    assert_eq!(result.winning_line, vec!["Be6", "cxd3", "Nb3#"]);
}

/// Validates winning_line_popeye output format for compatibility with the TypeScript parsePopeyeRow parser.
/// Each ply is formatted as `{piece}{from}{type}{to}{effects}` (e.g., `Qb1-f1!`, `Bg2*f1`, `Bh5-f3#`).
/// The key move carries `!`, captures use `*`, normal moves use `-`, checkmate appends `#`.
#[test]
fn pipeline_winning_line_popeye_format_is_parser_compatible() {
    let input = "Stipulation: #2\nFEN: 7n/3NR3/1P3p2/1p1kbN1B/1p6/1K6/6b1/1Q6 w - - 0 1";
    let ast = parse_popeye(input).expect("input should parse");
    let problem = ast_to_problem(ast).expect("mapping should succeed");
    let result = solve(&problem, &SolverConfig::default()).expect("#2 should solve");

    assert!(result.solved);
    let popeye = &result.winning_line_popeye;
    // Three plies: key move (white), defense (black), checkmate (white)
    assert_eq!(popeye.len(), 3, "mate-in-2 should produce 3 half-moves in winning_line_popeye");

    // Key move must end with '!' (signals the key in Popeye notation)
    assert!(popeye[0].ends_with('!'), "key move should carry '!' suffix, got: {}", popeye[0]);
    // Key move is a queen move from b1 to f1
    assert!(popeye[0].starts_with("Qb1-f1"), "key move should be Qb1-f1!, got: {}", popeye[0]);

    // Defense is a bishop capture (black) – no '!' on non-key moves
    assert!(popeye[1].contains('*'), "defense should be a capture using '*', got: {}", popeye[1]);
    assert!(!popeye[1].ends_with('!'), "defense should not carry '!'");

    // Checkmate move ends with '#'
    assert!(popeye[2].ends_with('#'), "checkmate move should carry '#' suffix, got: {}", popeye[2]);
}

/// Full pipeline streaming test: verifies that solve_streaming delivers solutions
/// incrementally through parse → map → stream for a multi-solution position.
#[test]
fn pipeline_streaming_delivers_solutions_incrementally() {
    // Position with multiple #1 solutions (king on a8, queen on b6, king on c7)
    let input = "Stipulation: #1\nFEN: k7/2K5/1Q6/8/8/8/8/8 w - - 0 1";
    let ast = parse_popeye(input).expect("input should parse");
    let problem = ast_to_problem(ast).expect("mapping should succeed");

    let mut solutions: Vec<Vec<String>> = Vec::new();
    let summary = solve_streaming(&problem, &SolverConfig::default(), None, |result| {
        solutions.push(result.winning_line);
        StreamDirective::Continue
    })
    .expect("streaming should succeed");

    assert!(summary.solutions_found >= 1, "at least one #1 solution should be found");
    assert_eq!(solutions.len(), summary.solutions_found);
    assert!(!summary.timed_out);

    // Each solution is a single ply (checkmate in 1)
    for winning_line in &solutions {
        assert_eq!(winning_line.len(), 1, "each #1 solution should have exactly one move");
        assert!(
            winning_line[0].ends_with('#'),
            "each #1 solution should be a checkmate: {}",
            winning_line[0]
        );
    }
}

/// Full pipeline streaming test with early stop: verifies that StreamDirective::Stop
/// halts the search after collecting the requested number of solutions.
#[test]
fn pipeline_streaming_stops_early_on_directive() {
    let input = "Stipulation: #1\nFEN: k7/2K5/1Q6/8/8/8/8/8 w - - 0 1";
    let ast = parse_popeye(input).expect("input should parse");
    let problem = ast_to_problem(ast).expect("mapping should succeed");

    let mut call_count = 0usize;
    let summary = solve_streaming(&problem, &SolverConfig::default(), Some(1), |_result| {
        call_count += 1;
        StreamDirective::Continue
    })
    .expect("streaming should succeed");

    assert_eq!(call_count, 1, "callback should be invoked exactly once with max_solutions=1");
    assert_eq!(summary.solutions_found, 1);
    assert!(summary.stopped_early, "search should report stopped_early=true");
}
