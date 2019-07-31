using System;

namespace SP.Core
{
    public struct Stipulation
    {
        public Stipulation(decimal depth)
        {
            Depth = depth;
            stipulationType = StipulationTypes.DirectMate;
        }
        public Stipulation(StipulationType sttype, decimal depth)
        {
            Depth = depth;
            stipulationType = sttype;
        }

        public PieceColors StartingMoveColor =>
            // se il numero di mosse è intero vale quello legato alla stipulazione
            Depth == Math.Truncate(Depth) ? StipulationType.ColorToMove
            // se il numero di mosse è decimale inverto quello della stipulazione
            : StipulationType.ColorToMove == PieceColors.Black ? PieceColors.White
            : PieceColors.Black;

        private StipulationType stipulationType;

        public decimal Depth;
        public StipulationType StipulationType { get => stipulationType; private set => stipulationType = value; }

        public override string ToString()
        {
            return $"{StipulationType}{Depth}";
        }
    }
}