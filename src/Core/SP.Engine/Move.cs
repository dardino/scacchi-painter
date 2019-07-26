using SP.Core;
using System;
using System.Collections.Generic;
using System.Linq;

namespace SP.Engine
{
	public class HalfMove
	{
		public EnginePiece Piece;
		public Square SourceSquare;
		public Square DestinationSquare;
		public bool IsCapture;
		public IEnumerable<HalfMove> SubSequentialMoves;
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

		public HalfMove Clone() {
			return new HalfMove()
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