using SP.Core;
using System;
using System.Collections.Generic;
using System.Linq;

namespace SP.Engine
{
	public struct Move
	{
		public EnginePiece Piece;
		public Square SourceSquare;
		public Square DestinationSquare;
		public bool IsCapture;
		public IEnumerable<Move> SubSequentialMoves;
		public override string ToString()
		{
			var sep = IsCapture ? "*" : "-";
			var extra = SubSequentialMoves != null && SubSequentialMoves.Count() > 0 
				? $"[{String.Join(";", SubSequentialMoves)}]" 
				: "";
			return Piece 
				+ $"{SourceSquare}{sep}{DestinationSquare}".ToLower() 
				+ extra;
		}

		public Move Clone() {
			return new Move()
			{
				Piece = Piece,
				DestinationSquare = DestinationSquare,
				IsCapture = IsCapture,
				SourceSquare = SourceSquare,
				SubSequentialMoves = null
			};

		}
		
	}
}