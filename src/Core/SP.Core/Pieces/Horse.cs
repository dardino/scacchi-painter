using System;
using System.Collections.Generic;
using System.Text;

namespace SP.Core.Pieces
{
	[Figurine(PieceFigurine.Horse)]
	public class Horse : PieceBase
	{
		public override int GetMovesFromPosition(Columns col, Rows row)
		{
			throw new NotImplementedException();
		}
	}
}
