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
    let problem = ast_to_problem(ast);
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
        let output = run("BeginProblem", &SolverConfig::default())
            .expect("non-empty MVP input should be accepted");

        assert_eq!(output, "solved=false explored_nodes=0");
    }

    #[test]
    fn run_propagates_parse_errors() {
        let error = run("   ", &SolverConfig::default()).expect_err("empty input should fail");

        assert!(error.to_string().contains("empty input"));
    }
}
