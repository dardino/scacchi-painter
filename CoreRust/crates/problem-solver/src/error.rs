use thiserror::Error;

#[derive(Debug, Error)]
pub enum SolverError {
    #[error("unsupported stipulation: {0}")]
    UnsupportedStipulation(String),
    #[error("invalid problem position: {0}")]
    InvalidProblemPosition(String),
}
