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

		[TestMethod]
		public void LoadFromNotation() {
			var notation = "3QN3/2p1rr2/b2nkp2/1p3n2/3P4/1p2p1b1/pP2p1q1/2K5";
			var board = Board.FromNotation(notation);

			var p01 = board.GetPiece(Columns.ColD, Rows.Row8);
			var p02 = board.GetPiece(Columns.ColE, Rows.Row8);
			var p03 = board.GetPiece(Columns.ColC, Rows.Row7);
			var p04 = board.GetPiece(Columns.ColE, Rows.Row7);
			var p05 = board.GetPiece(Columns.ColF, Rows.Row7);
			var p06 = board.GetPiece(Columns.ColA, Rows.Row6);
			var p07 = board.GetPiece(Columns.ColD, Rows.Row6);
			var p08 = board.GetPiece(Columns.ColE, Rows.Row6);
			var p09 = board.GetPiece(Columns.ColF, Rows.Row6);
			var p20 = board.GetPiece(Columns.ColB, Rows.Row5);
			var p21 = board.GetPiece(Columns.ColF, Rows.Row5);
			var p22 = board.GetPiece(Columns.ColD, Rows.Row4);
			var p23 = board.GetPiece(Columns.ColB, Rows.Row3);
			var p24 = board.GetPiece(Columns.ColE, Rows.Row3);
			var p25 = board.GetPiece(Columns.ColG, Rows.Row3);
			var p26 = board.GetPiece(Columns.ColA, Rows.Row2);
			var p27 = board.GetPiece(Columns.ColB, Rows.Row2);
			var p28 = board.GetPiece(Columns.ColE, Rows.Row2);
			var p29 = board.GetPiece(Columns.ColG, Rows.Row2);
			var p30 = board.GetPiece(Columns.ColC, Rows.Row1);

			// test Piece Type
			Assert.AreEqual(p01.GetType(), typeof(Pieces.Queen ));
			Assert.AreEqual(p02.GetType(), typeof(Pieces.Horse ));
			Assert.AreEqual(p03.GetType(), typeof(Pieces.Pawn  ));
			Assert.AreEqual(p04.GetType(), typeof(Pieces.Rock  ));
			Assert.AreEqual(p05.GetType(), typeof(Pieces.Rock  ));
			Assert.AreEqual(p06.GetType(), typeof(Pieces.Bishop));
			Assert.AreEqual(p07.GetType(), typeof(Pieces.Horse ));
			Assert.AreEqual(p08.GetType(), typeof(Pieces.King  ));
			Assert.AreEqual(p09.GetType(), typeof(Pieces.Pawn  ));
			Assert.AreEqual(p20.GetType(), typeof(Pieces.Pawn  ));
			Assert.AreEqual(p21.GetType(), typeof(Pieces.Horse ));
			Assert.AreEqual(p22.GetType(), typeof(Pieces.Pawn  ));
			Assert.AreEqual(p23.GetType(), typeof(Pieces.Pawn  ));
			Assert.AreEqual(p24.GetType(), typeof(Pieces.Pawn  ));
			Assert.AreEqual(p25.GetType(), typeof(Pieces.Bishop));
			Assert.AreEqual(p26.GetType(), typeof(Pieces.Pawn  ));
			Assert.AreEqual(p27.GetType(), typeof(Pieces.Pawn  ));
			Assert.AreEqual(p28.GetType(), typeof(Pieces.Pawn  ));
			Assert.AreEqual(p29.GetType(), typeof(Pieces.Queen ));
			Assert.AreEqual(p30.GetType(), typeof(Pieces.King  ));

			// test Piece Color

			Assert.AreEqual(PieceColors.White, p01.Color);
			Assert.AreEqual(PieceColors.White, p02.Color);
			Assert.AreEqual(PieceColors.Black, p03.Color);
			Assert.AreEqual(PieceColors.Black, p04.Color);
			Assert.AreEqual(PieceColors.Black, p05.Color);
			Assert.AreEqual(PieceColors.Black, p06.Color);
			Assert.AreEqual(PieceColors.Black, p07.Color);
			Assert.AreEqual(PieceColors.Black, p08.Color);
			Assert.AreEqual(PieceColors.Black, p09.Color);
			Assert.AreEqual(PieceColors.Black, p20.Color);
			Assert.AreEqual(PieceColors.Black, p21.Color);
			Assert.AreEqual(PieceColors.White, p22.Color);
			Assert.AreEqual(PieceColors.Black, p23.Color);
			Assert.AreEqual(PieceColors.Black, p24.Color);
			Assert.AreEqual(PieceColors.Black, p25.Color);
			Assert.AreEqual(PieceColors.Black, p26.Color);
			Assert.AreEqual(PieceColors.White, p27.Color);
			Assert.AreEqual(PieceColors.Black, p28.Color);
			Assert.AreEqual(PieceColors.Black, p29.Color);
			Assert.AreEqual(PieceColors.White, p30.Color);

			// test Counter

			Assert.AreEqual(board.WhiteCount  , 5 );
			Assert.AreEqual(board.BlackCount  , 15);
			Assert.AreEqual(board.NeutralCount, 0 );


		}
	}
}
