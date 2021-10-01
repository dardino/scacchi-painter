export interface IProblemSolverConfig {
  executablePath: string;
  extraOptions?: string[];
  enabled: boolean;
}

export interface IApplicationConfig {
  problemSolvers: { [key in "Popeye"]: IProblemSolverConfig };
}
