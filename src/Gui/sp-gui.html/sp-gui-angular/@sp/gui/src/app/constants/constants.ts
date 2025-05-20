export const istructionRegExp = new RegExp(
  `^(Popeye|BeginProblem|Pieces|White|Black|Stipulation|Option|Twin|EndProblem|Condition|SetPlay|Executing|solution finished|Starting popeye|try play).*$`
);
export const outlogRegExp = new RegExp(
  `^(ERR:|Execute|Popeye|starting engine|Engine process|program exited).*$`
);


/*
 * BeginProblem
 * Pieces
 * White Kf2 Bf7 Pe6 Pg6 Pf5 Rg5 Pg4 Pc3 Pd2 Ph5
 * Black Pe7 Pg7 Pc5 Ka4 Pc4 Qf6 Pb5 Ph4 Rg3 Rc2 Sb2
 * Stipulation H#4
 * Option Try NoBoard Variations WhiteToPlay
 * Twin Move b5 a3
 * EndProblem
 * Execute command: pywin64.exe tmp
 * Popeye Windows-64Bit v4.79 (4207 MB)
 */
