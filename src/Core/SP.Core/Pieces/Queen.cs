using System;
using System.Collections.Generic;
using System.Text;

namespace SP.Core.Pieces
{
	[Figurine(PieceFigurine.Queen)]
	public class Queen : PieceBase
	{
		public override int GetMovesFromPosition(Columns col, Rows row)
		{
			throw new NotImplementedException();
		}
	}
}
