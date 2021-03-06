﻿using Microsoft.VisualStudio.TestTools.UnitTesting;
using System;
using SP.Core.Utils;
using System.Collections.Generic;
using System.Text;

namespace SP.Core.Test
{
	[TestClass]
	[TestCategory("Core.Board")]
	public class BoardTests
	{
		[TestMethod]
		[Priority(1)]
		public void FillBoardCellsOnConstructor()
		{
			var board = new Board();
			var p1 = board.GetPiece(Columns.ColA, Rows.Row1);
			Assert.IsNull(p1);
			BoardUtils.PlacePieceOnBoard(board, Columns.ColF, Rows.Row4, new Core.Pieces.Queen { Color = PieceColors.White });
			var p2 = board.GetPiece(Columns.ColF, Rows.Row4);
			Assert.AreEqual(p2.GetType(), typeof(Core.Pieces.Queen));
		}
		[TestMethod]
		[Priority(1)]
		public void LoadFromNotationAndStipulation()
		{
			var notation = "3QN3/2p1rr2/b2nkp2/1p3n2/3P4/1p2p1b1/pP2p1q1/2K5";
			var board = BoardUtils.FromNotation(notation, new Stipulation(StipulationTypes.HelpMate, 2));
			Assert.AreEqual(PieceColors.Black, board.Stipulation.StartingMoveColor, "check starting color");
			board = BoardUtils.FromNotation(notation, new Stipulation(StipulationTypes.DirectMate, 2));
			Assert.AreEqual(PieceColors.White, board.Stipulation.StartingMoveColor, "check starting color");
			board = BoardUtils.FromNotation(notation, new Stipulation(StipulationTypes.HelpMate, 0.5m));
			Assert.AreEqual(PieceColors.White, board.Stipulation.StartingMoveColor, "check starting color");
			board = BoardUtils.FromNotation(notation, new Stipulation(StipulationTypes.DirectMate, 0.5m));
			Assert.AreEqual(PieceColors.Black, board.Stipulation.StartingMoveColor, "check starting color");
		}
		[TestMethod]
		[Priority(1)]
		public void LoadFromNotation() {
			var notation = "3QN3/2p1rr2/b2nkp2/1p3n2/3P4/1p2p1b1/pP2p1q1/2K5";
			var board = BoardUtils.FromNotation(notation);

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
			Assert.AreEqual(typeof(Core.Pieces.Queen ), p01.GetType());
			Assert.AreEqual(typeof(Core.Pieces.Horse ), p02.GetType());
			Assert.AreEqual(typeof(Core.Pieces.Pawn  ), p03.GetType());
			Assert.AreEqual(typeof(Core.Pieces.Rock  ), p04.GetType());
			Assert.AreEqual(typeof(Core.Pieces.Rock  ), p05.GetType());
			Assert.AreEqual(typeof(Core.Pieces.Bishop), p06.GetType());
			Assert.AreEqual(typeof(Core.Pieces.Horse ), p07.GetType());
			Assert.AreEqual(typeof(Core.Pieces.King  ), p08.GetType());
			Assert.AreEqual(typeof(Core.Pieces.Pawn  ), p09.GetType());
			Assert.AreEqual(typeof(Core.Pieces.Pawn  ), p20.GetType());
			Assert.AreEqual(typeof(Core.Pieces.Horse ), p21.GetType());
			Assert.AreEqual(typeof(Core.Pieces.Pawn  ), p22.GetType());
			Assert.AreEqual(typeof(Core.Pieces.Pawn  ), p23.GetType());
			Assert.AreEqual(typeof(Core.Pieces.Pawn  ), p24.GetType());
			Assert.AreEqual(typeof(Core.Pieces.Bishop), p25.GetType());
			Assert.AreEqual(typeof(Core.Pieces.Pawn  ), p26.GetType());
			Assert.AreEqual(typeof(Core.Pieces.Pawn  ), p27.GetType());
			Assert.AreEqual(typeof(Core.Pieces.Pawn  ), p28.GetType());
			Assert.AreEqual(typeof(Core.Pieces.Queen ), p29.GetType());
			Assert.AreEqual(typeof(Core.Pieces.King  ), p30.GetType());

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

			Assert.AreEqual(5 , board.WhiteCount  );
			Assert.AreEqual(15, board.BlackCount  );
			Assert.AreEqual(0 , board.NeutralCount);
			Assert.AreEqual(20, board.TotalCount  );

		}

		[TestMethod]
		[Priority(1)]
		public void NeutralPieceFromFEN()
		{
			var notation = "8/8/8/*p7/8/8/8/8";
			var board = BoardUtils.FromNotation(notation);

			var p01 = board.GetPiece(Columns.ColA, Rows.Row5);

			Assert.AreEqual(typeof(Core.Pieces.Pawn), p01.GetType());
			Assert.AreEqual(PieceColors.Neutral, p01.Color);
		}

	}
}
