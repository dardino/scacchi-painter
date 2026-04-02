use anyhow::Result;
use clap::{Parser, ValueEnum};
use problem_io::{ast_to_problem, parse_popeye};
use problem_solver::{solve, SolverConfig};
use serde::Serialize;
use std::fs;
use std::path::{Path, PathBuf};

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
}

#[derive(Debug, Serialize)]
struct CorpusCaseResult {
    file: String,
    solved: bool,
    explored_nodes: u64,
    winning_line_len: usize,
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
    })
}

fn format_output(output: &CliOutput, format: OutputFormat) -> Result<String> {
    let text = match format {
        OutputFormat::Text => format!(
            "solved={} explored_nodes={} winning_line_len={}",
            output.solved,
            output.explored_nodes,
            output.winning_line.len()
        ),
        OutputFormat::Json => serde_json::to_string(output)?,
    };

    Ok(text)
}

fn run_corpus(dir: &Path, config: &SolverConfig, format: OutputFormat) -> Result<String> {
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
            Ok(input) => match solve_input(&input, config) {
                Ok(out) => CorpusCaseResult {
                    file,
                    solved: out.solved,
                    explored_nodes: out.explored_nodes,
                    winning_line_len: out.winning_line.len(),
                    error: None,
                },
                Err(err) => CorpusCaseResult {
                    file,
                    solved: false,
                    explored_nodes: 0,
                    winning_line_len: 0,
                    error: Some(err.to_string()),
                },
            },
            Err(err) => CorpusCaseResult {
                file,
                solved: false,
                explored_nodes: 0,
                winning_line_len: 0,
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
                    lines.push(format!(
                        "{}: solved={} explored_nodes={} winning_line_len={}",
                        case.file, case.solved, case.explored_nodes, case.winning_line_len
                    ));
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

fn main() -> Result<()> {
    tracing_subscriber::fmt::init();

    let cli = Cli::parse();
    let output = if let Some(corpus_dir) = &cli.corpus_dir {
        run_corpus(corpus_dir, &SolverConfig::default(), cli.format)?
    } else {
        let input = load_input(&cli)?;
        let result = solve_input(&input, &SolverConfig::default())?;
        format_output(&result, cli.format)?
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
        let output = format_output(&result, OutputFormat::Text).expect("text output should format");

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
        assert!(output.ends_with("winning_line_len=0"));
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
        let json = format_output(&result, OutputFormat::Json).expect("json output should format");

        assert!(json.contains("\"winning_line\""));
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
        };

        let loaded = load_input(&cli).expect("file input should load");
        assert!(loaded.contains("Stipulation"));
    }

    #[test]
    fn run_corpus_reports_all_cases() {
        let dir = Path::new(env!("CARGO_MANIFEST_DIR")).join("corpus");
        let output = run_corpus(&dir, &SolverConfig::default(), OutputFormat::Text)
            .expect("corpus should execute");

        assert!(output.contains("cases=2"));
        assert!(output.contains("mate_in_1.popeye"));
        assert!(output.contains("no_solution_empty_board.popeye"));
    }
}
