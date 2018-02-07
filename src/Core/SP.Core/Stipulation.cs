using System;

namespace SP.Core
{
	public class Stipulation
	{
		public Stipulation(decimal depth)
		{
			StipulationType = StipulationType.DirectMate;
			Depth = depth;
		}
		public Stipulation(StipulationType sttype, decimal depth)
		{
			StipulationType = sttype;
			Depth = depth;
		}

		public PieceColors StartingMoveColor
		{
			get
			{
				return (
				// se il numero di mosse è intero vale quello legato alla stipulazione
				Depth == Math.Truncate(Depth) ? StipulationType.ColorToMove
				// se il numero di mosse è decimale inverto quello della stipulazione
				: StipulationType.ColorToMove == PieceColors.Black ? PieceColors.White
				: PieceColors.Black
				);
			}
		}

		private StipulationType stipulationType;

		public decimal Depth { get; set; } = 2;
		public StipulationType StipulationType { get => stipulationType; private set => stipulationType = value; }

		public override string ToString()
		{
			return $"{StipulationType}{Depth}";
		}
	}
}