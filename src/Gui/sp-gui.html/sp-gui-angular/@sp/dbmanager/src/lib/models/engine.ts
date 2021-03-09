/* eslint-disable max-len */
export const EngineOptions = {
  Try: { argsCount: 0, help: "calculate if a move is a try." },
  Defence: {
    argsCount: 0,
    help: `this option is followed by a number indicating the number of defences which should be taken into consideration.
    For instance Defence 1 all real tries are calculated.`,
  },
  SetPlay: { argsCount: 0, help: "calculate setplay." },
  NullMoves: {
    argsCount: 0,
    help: "Allows the moving side to play a null move. Servers for finding tempo tries.",
  },
  Threat: {
    argsCount: 0,
    help: `for moremovers: This option must be followed by an integer.
    The opposit party has defended when there is no threat in less or equal this number of moves.`,
  },
  WhiteToPlay: { argsCount: 0, help: "white starts moving in helpplay." },
  Variation: { argsCount: 0, help: "show threats and variations." },
  MoveNumbers: {
    argsCount: 0,
    help: "Movenumber, already calculated move and cumulated solving time on output.",
  },
  StartMoveNumber: {
    argsCount: 0,
    help: "This option is followed by the Movenumber popeye was interrupted at.",
  },
  NoWk: { argsCount: 0, help: "without white king" },
  NoBk: { argsCount: 0, help: "without black king" },
  Duplex: { argsCount: 0, help: "calculate stipulation for both sides" },
  NoThreat: {
    argsCount: 0,
    help: "calculate variations without calculating threats",
  },
  MaxSolutions: {
    argsCount: 0,
    help: "This option must be followed by an integer. Popeye stops calculating if this number of solutions are reached.",
  },
  MaxFlightsquares: {
    argsCount: 0,
    help: `for moremovers: This option must be followed by an integer.
    The opposit party has defended when the number of flightsquares for it's king are more or equal this number.`,
  },
  EnPassant: {
    argsCount: 0,
    help: `Must be followed by 3-4 squares which indicate the pawn move just played:
    - departure square
    - avoided squares
    - arrival square
    This information is used for potential en passant keys.`,
  },
  CastlingMutuallyExclusive: {
    argsCount: 2,
    help: `<wrooksquare><brooksquare>
    Castlings with the rooks that occupy the
    indicated squares in the game array are
    mutually exclusive.
    Example: CastlingMutuallyExclusive a1h8
    For indicating more than one pair of mutually
    exclusive castlings, the option can used
    multiple times.`,
  },
  NoBoard: {
    argsCount: 0,
    help: "chessboard is not printed to screen or into file.",
  },
  NoShortVariations: {
    argsCount: 0,
    help: "Short variations are suppressed on output.",
  },
  HalfDuplex: {
    argsCount: 0,
    help: "calculate stipulation only for the opponent side.",
  },
  PostKeyPlay: {
    argsCount: 0,
    help: "The position entered is considered to be the position after the key. Just the solution play is analysed.",
  },
  NonTrivial: {
    argsCount: 2,
    help: `<m> <n>  A special option to solve/cook/test long self and (semi)reflex problems.
    The second argument n deter- mines which black moves are considered to be trivial - a move that can be met by a s#n (or r=n resp.).
    In long problems (more than n moves) black has at every stage at least one nontrivial move.
    I. e. a move that doesnot lead to a s#n. The first argument m determines how many additional nontrivial moves can be granted to black by white during the whole solving procedure.
    Example: nontr 0 1.
    This is the most restrictive option.
    White forced to play moves that leave black with only one move not met by a s#1.`,
  },
  Intelligent: {
    argsCount: 0,
    help: `intelligent (quick) solving of helpmate-moremovers.
    After the intelligent option, the maximum number of solutions per mating position can be given.`,
  },
  MaxTime: {
    argsCount: 0,
    help: `This option must be followed by an integer.
    Popeye stops calculating if this number of seconds solving time are reached.`,
  },
  NoCastling: {
    argsCount: 0,
    help: "This option must be followed by the squares of those pieces that cannot castle anymore in the diagram position.",
  },
  Quodlibet: {
    argsCount: 0,
    help: "In s# or r# also direct mates are a solution.",
  },
  StopOnShortSolutions: {
    argsCount: 0,
    help: "Calculation is terminated after detecting of short solutions.",
  },
  Beep: {
    argsCount: 0,
    help: "This option can be followed by an integer. Each time Popeye has found a solution it beeps a number of times.",
  },
  SuppressGrid: {
    argsCount: 0,
    help: "(Grid Chess) Suppress the rendition of grid lines in text and LaTeX output.",
  },
  WriteGrid: {
    argsCount: 0,
    help: `(Grid Chess) Writes an additional board that the partition of the board into grid cells.
    Useful for irregular grids.`,
  },
  KeepMatingPiece: {
    argsCount: 0,
    help: "Stop solving when there is no piece left that could deliver mate.",
  },
  LastCapture: {
    argsCount: 1,
    help: `Follow by a colour, piece and square as in the piece command.
    Specifies piece captured on move leading to the diagram.`,
  },
  GoalIsEnd: {
    argsCount: 0,
    help: "applicable if the goal doesn't lead to immobility (e.g. z, x): the play ends if the wrong side reaches the goal.",
  },
} as const;
