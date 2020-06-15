export interface IProblemSolverConfig {
  executablePath: string;
  enabled: boolean;
}

export interface IApplicationConfig {
  problemSolvers: { [key in "Popeye"]: IProblemSolverConfig };
}
