using SP.Core;

namespace SP.Engine
{
	public struct Move
	{
		public EnginePiece Piece;
		public Square SourceSquare;
		public Square DestinationSquare;
		public bool IsCapture;
	}
}