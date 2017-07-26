using System;
using System.Collections;
using System.Collections.Generic;
using System.Text;

namespace SP.Core.Pieces
{
	[Figurine(PieceFigurine.Pawn)]
	public class Pawn : PieceBase
	{
		public override ulong GetCapturesFromPosition(Columns col, Rows row, ulong allied, ulong enemies)
		{
			throw new NotImplementedException();
		}

		public override ulong GetCapturesFromPosition(Square s, ulong allied, ulong enemies)
		{
			throw new NotImplementedException();
		}

		public override ulong GetMovesFromPosition(Columns col, Rows row)
		{
			throw new NotImplementedException();
		}

		public override ulong GetMovesFromPosition(Columns col, Rows row, ulong allied, ulong enemies)
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
