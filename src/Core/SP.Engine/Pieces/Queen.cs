using System;
using System.Collections.Generic;
using System.Text;
using SP.Core;

namespace SP.Engine.Pieces
{
	[Figurine(PieceFigurine.Queen)]
	public class Queen : EnginePiece
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
