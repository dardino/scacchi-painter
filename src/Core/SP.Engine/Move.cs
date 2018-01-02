using SP.Core;

namespace SP.Engine
{
	public struct Move
	{
		public EnginePiece Piece;
		public Square SourceSquare;
		public Square DestinationSquare;
		public bool IsCapture;

		public override string ToString()
		{
			var sep = IsCapture ? "*" : "-";
			return $"{Piece}{SourceSquare}{sep}{DestinationSquare}";
		}
	}
}