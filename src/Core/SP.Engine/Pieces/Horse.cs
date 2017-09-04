using SP.Core;
using System;
using System.Collections.Generic;
using System.Text;

namespace SP.Engine.Pieces
{
	[Figurine(PieceFigurine.Horse)]
	public class Horse : EnginePiece
	{
		public override ulong GetCapturesFromPosition(Square s, ulong allied, ulong enemies)
		{
			throw new NotImplementedException();
		}

		public override ulong GetMovesFromPosition(Square s, ulong allied, ulong enemies)
		{
			throw new NotImplementedException();
		}

		public override bool IsAttackingSquare(Square fromSquare, Square squareToCheck, ulong allied, ulong enemies)
		{
			throw new NotImplementedException();
		}
	}
}
