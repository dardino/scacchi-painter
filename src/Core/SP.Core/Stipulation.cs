using System;

namespace SP.Core
{
	public class Stipulation
	{
		public Stipulation(decimal depth)
		{
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
		public StipulationType StipulationType { get; set; } = StipulationType.DirectMate;
		public decimal Depth { get; set; } = 2;

		public override string ToString()
		{
			return $"{StipulationType}{Depth}";
		}
	}
}