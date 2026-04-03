use anyhow::Result;
use clap::{Parser, ValueEnum};
use problem_io::{ast_to_problem, parse_popeye};
use problem_solver::{solve, SolutionTree, SolverConfig};
use serde::Serialize;
use std::fs;
use std::path::{Path, PathBuf};
use std::time::Instant;

#[derive(Debug, Parser)]
#[command(name = "solver-cli")]
struct Cli {
    #[arg(long)]
    corpus_dir: Option<PathBuf>,
    #[arg(short = 'i', long)]
    input_text: Option<String>,
    #[arg(short = 'f', long)]
    input_file: Option<PathBuf>,
    #[arg(long, value_enum, default_value = "text")]
    format: OutputFormat,
    #[arg(long)]
    benchmark_runs: Option<u32>,
}

#[derive(Debug, Clone, Copy, ValueEnum)]
enum OutputFormat {
    Text,
    Json,
}

#[derive(Debug, Serialize)]
struct CliOutput {
    solved: bool,
    explored_nodes: u64,
    winning_line: Vec<String>,
    solution: Option<SolutionTree>,
}

#[derive(Debug, Clone, Serialize)]
struct BenchmarkStats {
    runs: u32,
    min_us: u128,
    avg_us: u128,
    max_us: u128,
    total_us: u128,
}

#[derive(Debug, Serialize)]
struct SingleRunReport {
    result: CliOutput,
    benchmark: Option<BenchmarkStats>,
}

#[derive(Debug, Serialize)]
struct CorpusCaseResult {
    file: String,
    solved: bool,
    explored_nodes: u64,
    winning_line_len: usize,
    winning_line: Vec<String>,
    solution: Option<SolutionTree>,
    benchmark: Option<BenchmarkStats>,
    error: Option<String>,
}

#[derive(Debug, Serialize)]
struct CorpusReport {
    total_cases: usize,
    solved_cases: usize,
    failed_cases: usize,
    results: Vec<CorpusCaseResult>,
}

fn load_input(cli: &Cli) -> Result<String> {
    if let Some(text) = &cli.input_text {
        return Ok(text.clone());
    }

    if let Some(path) = &cli.input_file {
        return Ok(fs::read_to_string(path)?);
    }

    anyhow::bail!("either --input-text or --input-file must be provided")
}

fn solve_input(input: &str, config: &SolverConfig) -> Result<CliOutput> {
    let ast = parse_popeye(input)?;
    let problem = ast_to_problem(ast)?;
    let result = solve(&problem, config)?;

    Ok(CliOutput {
        solved: result.solved,
        explored_nodes: result.explored_nodes,
        winning_line: result.winning_line,
        solution: result.solution,
    })
}

fn benchmark_input(input: &str, config: &SolverConfig, runs: u32) -> Result<(CliOutput, BenchmarkStats)> {
    if runs == 0 {
        anyhow::bail!("--benchmark-runs must be greater than 0");
    }

    let mut result: Option<CliOutput> = None;
    let mut total_us: u128 = 0;
    let mut min_us: u128 = u128::MAX;
    let mut max_us: u128 = 0;

    for _ in 0..runs {
        let start = Instant::now();
        let current = solve_input(input, config)?;
        let elapsed_us = start.elapsed().as_micros();

        total_us = total_us.saturating_add(elapsed_us);
        min_us = min_us.min(elapsed_us);
        max_us = max_us.max(elapsed_us);
        result = Some(current);
    }

    let avg_us = total_us / runs as u128;
    let stats = BenchmarkStats {
        runs,
        min_us,
        avg_us,
        max_us,
        total_us,
    };

    Ok((result.expect("at least one run should produce a result"), stats))
}

fn format_single_report(report: &SingleRunReport, format: OutputFormat) -> Result<String> {
    match format {
        OutputFormat::Json => Ok(serde_json::to_string(report)?),
        OutputFormat::Text => {
            let mut text = format!(
                "solved={} explored_nodes={} winning_line_len={} winning_line={}",
                report.result.solved,
                report.result.explored_nodes,
                report.result.winning_line.len(),
                format_winning_line(&report.result.winning_line)
            );

            if let Some(solution) = &report.result.solution {
                text.push('\n');
                text.push_str(&format_solution_numbered(solution));
            }

            if let Some(bench) = &report.benchmark {
                text.push_str(&format!(
                    " runs={} min_us={} avg_us={} max_us={} total_us={}",
                    bench.runs, bench.min_us, bench.avg_us, bench.max_us, bench.total_us
                ));
            }

            Ok(text)
        }
    }
}

fn run_corpus(
    dir: &Path,
    config: &SolverConfig,
    format: OutputFormat,
    benchmark_runs: Option<u32>,
) -> Result<String> {
    let mut paths = Vec::new();
    for entry in fs::read_dir(dir)? {
        let entry = entry?;
        let path = entry.path();
        if is_popeye_file(&path) {
            paths.push(path);
        }
    }
    paths.sort();

    let mut results = Vec::new();
    for path in paths {
        let file = path
            .file_name()
            .and_then(|n| n.to_str())
            .unwrap_or("<unknown>")
            .to_string();

        let case = match fs::read_to_string(&path) {
            Ok(input) => {
                let output = if let Some(runs) = benchmark_runs {
                    benchmark_input(&input, config, runs).map(|(result, bench)| (result, Some(bench)))
                } else {
                    solve_input(&input, config).map(|result| (result, None))
                };

                match output {
                    Ok((out, benchmark)) => CorpusCaseResult {
                        file,
                        solved: out.solved,
                        explored_nodes: out.explored_nodes,
                        winning_line_len: out.winning_line.len(),
                        winning_line: out.winning_line,
                        solution: out.solution,
                        benchmark,
                        error: None,
                    },
                    Err(err) => CorpusCaseResult {
                        file,
                        solved: false,
                        explored_nodes: 0,
                        winning_line_len: 0,
                        winning_line: vec![],
                        solution: None,
                        benchmark: None,
                        error: Some(err.to_string()),
                    },
                }
            }
            Err(err) => CorpusCaseResult {
                file,
                solved: false,
                explored_nodes: 0,
                winning_line_len: 0,
                winning_line: vec![],
                solution: None,
                benchmark: None,
                error: Some(err.to_string()),
            },
        };

        results.push(case);
    }

    let total_cases = results.len();
    let solved_cases = results.iter().filter(|c| c.error.is_none() && c.solved).count();
    let failed_cases = results.iter().filter(|c| c.error.is_some()).count();
    let report = CorpusReport {
        total_cases,
        solved_cases,
        failed_cases,
        results,
    };

    match format {
        OutputFormat::Json => Ok(serde_json::to_string(&report)?),
        OutputFormat::Text => {
            let mut lines = Vec::new();
            lines.push(format!(
                "cases={} solved={} failed={}",
                report.total_cases, report.solved_cases, report.failed_cases
            ));
            for case in &report.results {
                if let Some(error) = &case.error {
                    lines.push(format!("{}: error={}", case.file, error));
                } else {
                    let mut line = format!(
                        "{}: solved={} explored_nodes={} winning_line_len={} winning_line={}",
                        case.file,
                        case.solved,
                        case.explored_nodes,
                        case.winning_line_len,
                        format_winning_line(&case.winning_line)
                    );
                    if let Some(bench) = &case.benchmark {
                        line.push_str(&format!(
                            " runs={} min_us={} avg_us={} max_us={} total_us={}",
                            bench.runs, bench.min_us, bench.avg_us, bench.max_us, bench.total_us
                        ));
                    }
                    lines.push(line);

                    if let Some(solution) = &case.solution {
                        let numbered = format_solution_numbered(solution);
                        for solution_line in numbered.lines() {
                            lines.push(format!("  {solution_line}"));
                        }
                    }
                }
            }

            Ok(lines.join("\n"))
        }
    }
}

fn is_popeye_file(path: &Path) -> bool {
    path.extension()
        .and_then(|ext| ext.to_str())
        .is_some_and(|ext| ext.eq_ignore_ascii_case("popeye"))
}

fn format_winning_line(line: &[String]) -> String {
    if line.is_empty() {
        "[]".to_string()
    } else {
        format!("[{}]", line.join(","))
    }
}

fn format_solution_numbered(solution: &SolutionTree) -> String {
    let mut lines = vec!["solution:".to_string(), format!("1. {}", solution.key_move)];

    for defense in &solution.defenses {
        let continuation = format_numbered_sequence(2, true, &defense.continuation);
        if continuation.is_empty() {
            lines.push(format!("1... {}", defense.black_move));
        } else {
            lines.push(format!("1... {} {}", defense.black_move, continuation));
        }
    }

    lines.join("\n")
}

fn format_numbered_sequence(start_fullmove: u32, white_to_move: bool, san_moves: &[String]) -> String {
    let mut parts = Vec::new();
    let mut fullmove = start_fullmove;
    let mut white_turn = white_to_move;

    for san in san_moves {
        if white_turn {
            parts.push(format!("{fullmove}. {san}"));
            white_turn = false;
        } else {
            parts.push(format!("{fullmove}... {san}"));
            white_turn = true;
            fullmove = fullmove.saturating_add(1);
        }
    }

    parts.join(" ")
}

fn main() -> Result<()> {
    tracing_subscriber::fmt::init();

    let cli = Cli::parse();
    let output = if let Some(corpus_dir) = &cli.corpus_dir {
        run_corpus(
            corpus_dir,
            &SolverConfig::default(),
            cli.format,
            cli.benchmark_runs,
        )?
    } else {
        let input = load_input(&cli)?;
        let report = if let Some(runs) = cli.benchmark_runs {
            let (result, benchmark) = benchmark_input(&input, &SolverConfig::default(), runs)?;
            SingleRunReport {
                result,
                benchmark: Some(benchmark),
            }
        } else {
            SingleRunReport {
                result: solve_input(&input, &SolverConfig::default())?,
                benchmark: None,
            }
        };
        format_single_report(&report, cli.format)?
    };

    println!("{output}");
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::path::Path;

    #[test]
    fn text_output_formats_solver_result() {
        let input = "Stipulation: #2\nFEN: 8/8/8/8/8/8/8/8 w - - 0 1";
        let result = solve_input(input, &SolverConfig::default()).expect("valid subset should be accepted");
        let report = SingleRunReport {
            result,
            benchmark: None,
        };
        let output = format_single_report(&report, OutputFormat::Text).expect("text output should format");

        assert!(output.starts_with("solved=false explored_nodes="));
        let explored_part = output
            .split_whitespace()
            .nth(1)
            .expect("output should contain explored part");
        let explored = explored_part
            .split('=')
            .next_back()
            .expect("explored part should contain value")
            .parse::<u64>()
            .expect("node count should be numeric");
        assert!(explored > 0);
        assert!(output.contains("winning_line_len=0"));
        assert!(output.ends_with("winning_line=[]"));
    }

    #[test]
    fn solve_input_propagates_parse_errors() {
        let error = solve_input("   ", &SolverConfig::default()).expect_err("empty input should fail");

        assert!(error.to_string().contains("empty input"));
    }

    #[test]
    fn json_output_contains_winning_line_field() {
        let input = "Stipulation: #1\nFEN: k7/2K5/1Q6/8/8/8/8/8 w - - 0 1";
        let result = solve_input(input, &SolverConfig::default()).expect("valid problem should solve");
        let report = SingleRunReport {
            result,
            benchmark: None,
        };
        let json = format_single_report(&report, OutputFormat::Json).expect("json output should format");

        assert!(json.contains("\"winning_line\""));
        assert!(json.contains("\"solution\""));
    }

    #[test]
    fn load_input_reads_file() {
        let path = Path::new(env!("CARGO_MANIFEST_DIR"))
            .join("corpus")
            .join("mate_in_1.popeye");
        let cli = Cli {
            corpus_dir: None,
            input_text: None,
            input_file: Some(path),
            format: OutputFormat::Text,
            benchmark_runs: None,
        };

        let loaded = load_input(&cli).expect("file input should load");
        assert!(loaded.contains("Stipulation"));
    }

    #[test]
    fn run_corpus_reports_all_cases() {
        let dir = Path::new(env!("CARGO_MANIFEST_DIR")).join("corpus");
        let output = run_corpus(&dir, &SolverConfig::default(), OutputFormat::Text, None)
            .expect("corpus should execute");

        assert!(output.contains("cases=2"));
        assert!(output.contains("mate_in_1.popeye"));
        assert!(output.contains("no_solution_empty_board.popeye"));
        assert!(
            ["winning_line=[Qa5#]", "winning_line=[Qa6#]", "winning_line=[Qa7#]", "winning_line=[Qb7#]", "winning_line=[Qb8#]"]
                .iter()
                .any(|expected| output.contains(expected)),
            "unexpected SAN winning line in corpus output: {output}"
        );
    }

    #[test]
    fn benchmark_single_report_includes_runs_in_text() {
        let input = "Stipulation: #1\nFEN: k7/2K5/1Q6/8/8/8/8/8 w - - 0 1";
        let (result, bench) = benchmark_input(input, &SolverConfig::default(), 3)
            .expect("benchmark should execute");
        let report = SingleRunReport {
            result,
            benchmark: Some(bench),
        };
        let output = format_single_report(&report, OutputFormat::Text)
            .expect("text report should format");

        assert!(output.contains("runs=3"));
        assert!(output.contains("avg_us="));
    }

    #[test]
    fn text_output_uses_numbered_solution_format() {
        let input = "Stipulation: #1\nFEN: k7/2K5/1Q6/8/8/8/8/8 w - - 0 1";
        let result = solve_input(input, &SolverConfig::default()).expect("valid problem should solve");
        let report = SingleRunReport {
            result,
            benchmark: None,
        };

        let output = format_single_report(&report, OutputFormat::Text)
            .expect("text output should format");

        assert!(output.contains("solution:"));
        assert!(output.contains("1. "));
    }
}
