using Microsoft.VisualStudio.TestTools.UnitTesting;
using System;
using System.Collections.Generic;
using System.Text;

namespace SP.Core.Test
{
	[TestClass]
	public class BoardTests
	{
		[TestMethod]
		public void FillBoardCellsOnConstructor()
		{
			var board = new Board();
			var p1 = board.GetPiece(Columns.ColA, Rows.Row1);
			Assert.IsNull(p1);
			board.PlacePieceOnBoard(Columns.ColF, Rows.Row4, new Pieces.Queen { Color = PieceColors.White });
			var p2 = board.GetPiece(Columns.ColF, Rows.Row4);
			Assert.AreEqual(p2.GetType(), typeof(Pieces.Queen));
		}
	}
}
