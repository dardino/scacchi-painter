using System;
using System.Collections.Generic;
using System.Text;

namespace SP.Core.Pieces
{
	[Figurine(PieceFigurine.King)]
	public class King : PieceBase
	{
		public override int GetMovesFromPosition(Columns col, Rows row)
		{
			throw new NotImplementedException();
		}
	}
}
