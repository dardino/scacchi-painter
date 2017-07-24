using System;
using System.Collections;
using System.Collections.Generic;
using System.Text;

namespace SP.Core.Pieces
{
	[Figurine(PieceFigurine.Pawn)]
	public class Pawn : PieceBase
	{
		public override int GetMovesFromPosition(Columns col, Rows row)
		{
			throw new NotImplementedException();
		}
	}
}
