using Microsoft.VisualStudio.TestTools.UnitTesting;
using SP.Engine;
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
			UInt64 expectedBitboard = 7 << 8;

			BitBoard.Display(new BitBoard(expectedBitboard));
			
			var bitboardOfMoves = king.GetMovesFromPosition(Columns.ColA, Rows.Row1);
		}

	}
}
