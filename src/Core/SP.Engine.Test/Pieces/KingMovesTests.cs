using Microsoft.VisualStudio.TestTools.UnitTesting;
using System;
using System.Collections.Generic;
using System.Text;

namespace SP.Core.Engine.Pieces
{
	[TestClass]
	public class KingMovesTests
	{
		[TestMethod]
		public void MoveInABlankBoard()
		{
			var king = new Core.Pieces.King();
			var expectedBitboard = 3 << 8;
			var bitboardOfMoves = king.GetMovesFromPosition(Columns.ColA, Rows.Row1);
		}

	}
}
