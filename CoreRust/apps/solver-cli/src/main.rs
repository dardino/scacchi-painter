use anyhow::Result;
use clap::Parser;
use problem_io::{ast_to_problem, parse_popeye};
use problem_solver::{solve, SolverConfig};

#[derive(Debug, Parser)]
#[command(name = "solver-cli")]
struct Cli {
    #[arg(short, long)]
    input: String,
}

fn run(input: &str, config: &SolverConfig) -> Result<String> {
    let ast = parse_popeye(input)?;
    let problem = ast_to_problem(ast)?;
    let result = solve(&problem, config)?;

    Ok(format!(
        "solved={} explored_nodes={}",
        result.solved, result.explored_nodes
    ))
}

fn main() -> Result<()> {
    tracing_subscriber::fmt::init();

    let cli = Cli::parse();
    let output = run(&cli.input, &SolverConfig::default())?;

    println!("{output}");
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn run_formats_solver_output_for_mvp_problem() {
        let input = "Stipulation: #2\nFEN: 8/8/8/8/8/8/8/8 w - - 0 1";
        let output = run(input, &SolverConfig::default()).expect("valid subset should be accepted");

        assert!(output.starts_with("solved=false explored_nodes="));
        let explored = output
            .split('=').next_back()
            .expect("output should contain explored node count")
            .parse::<u64>()
            .expect("node count should be numeric");
        assert!(explored > 0);
    }

    #[test]
    fn run_propagates_parse_errors() {
        let error = run("   ", &SolverConfig::default()).expect_err("empty input should fail");

        assert!(error.to_string().contains("empty input"));
    }
}
