using Microsoft.VisualStudio.TestTools.UnitTesting;
using SP.Engine.Pieces;
using System;

namespace SP.Core.Engine.Pieces
{
	[TestClass]
	[TestCategory("Engine.Pieces.Pawn")]
	public class PawnMovesTests
	{
		// WHITE:
		// ---------------------------------
		// | X | X |   |   |   |   |   |   |
		// ---------------------------------
		// |   |   |   |   |   | X |   |   |
		// ---------------------------------
		// |   |   |   |   |   |   |   |   |
		// ---------------------------------
		// |   |   | X |   |   | X |   |   |
		// ---------------------------------
		// |   |   |   | X |   |   |   |   |
		// ---------------------------------
		// |   | X |   |   |   | X |   |   |
		// ---------------------------------
		// |   |   | X |   |   |   |   |   |
		// ---------------------------------
		// |   |   |   |   |   |   |   | X |
		// ---------------------------------
		ulong allied = 0xC004002410442001;
		// BLACK:
		// ---------------------------------
		// |   |   | X | X |   |   |   |   |
		// ---------------------------------
		// |   |   |   | X | X |   |   |   |
		// ---------------------------------
		// |   | X |   |   |   |   | X | X |
		// ---------------------------------
		// |   | X |   |   |   |   | X |   |
		// ---------------------------------
		// | X |   |   |   |   |   |   |   |
		// ---------------------------------
		// |   |   |   | X |   |   |   |   |
		// ---------------------------------
		// |   | X |   | X |   | X |   |   |
		// ---------------------------------
		// |   |   |   |   |   |   | X |   |
		// ---------------------------------
		ulong enemies = 0x3018434280105402;


		[TestMethod]
		public void P_MoveInABlankBoard()
		{

			var pawn = new Pawn();
			pawn.Color = PieceColors.White;

			UInt64 movesA1 = 0x8000;
			UInt64 movesB1 = 0x4000;
			UInt64 movesC2 = 0x20200000;
			UInt64 movesD4 = 0x1000000000;
			UInt64 movesA8 = 0x0;
			UInt64 movesH6 = 0x1000000000000;
			UInt64 movesH8 = 0x0;
			UInt64 movesH1 = 0x100;
			UInt64 movesF7 = 0x0400000000000000;
			UInt64 movesC7 = 0x2000000000000000;

			var bbMovesA1 = pawn.GetMovesFromPosition(Columns.ColA, Rows.Row1);
			var bbMovesB1 = pawn.GetMovesFromPosition(Columns.ColB, Rows.Row1);
			var bbMovesC2 = pawn.GetMovesFromPosition(Columns.ColC, Rows.Row2);
			var bbMovesD4 = pawn.GetMovesFromPosition(Columns.ColD, Rows.Row4);
			var bbMovesA8 = pawn.GetMovesFromPosition(Columns.ColA, Rows.Row8);
			var bbMovesH6 = pawn.GetMovesFromPosition(Columns.ColH, Rows.Row6);
			var bbMovesH8 = pawn.GetMovesFromPosition(Columns.ColH, Rows.Row8);
			var bbMovesH1 = pawn.GetMovesFromPosition(Columns.ColH, Rows.Row1);
			var bbMovesF7 = pawn.GetMovesFromPosition(Columns.ColF, Rows.Row7);
			var bbMovesC7 = pawn.GetMovesFromPosition(Columns.ColC, Rows.Row7);

			Assert.AreEqual(bbMovesA1, movesA1, "pa1-a2");
			Assert.AreEqual(bbMovesB1, movesB1, "pb1-b2");
			Assert.AreEqual(bbMovesC2, movesC2);
			Assert.AreEqual(bbMovesD4, movesD4);
			Assert.AreEqual(bbMovesA8, movesA8);
			Assert.AreEqual(bbMovesH6, movesH6);
			Assert.AreEqual(bbMovesH8, movesH8);
			Assert.AreEqual(bbMovesH1, movesH1);
			Assert.AreEqual(bbMovesF7, movesF7);
			Assert.AreEqual(bbMovesC7, movesC7);
		}

		[TestMethod]
		public void P_MoveInOccupiedBoard() {

			var pawn = new Pawn();
			pawn.Color = PieceColors.White;

			UInt64 movesA1 = 0xc000;
			UInt64 movesB1 = 0x0;
			UInt64 movesC2 = 0x20300000;
			UInt64 movesD4 = 0x1000000000;
			UInt64 movesA8 = 0x0;
			UInt64 movesH5 = 0x20000000000;
			UInt64 movesH6 = 0x1000000000000;
			UInt64 movesH8 = 0x0;
			UInt64 movesH1 = 0x100;
			UInt64 movesF7 = 0x0400000000000000;
			UInt64 movesC7 = 0x1000000000000000;
			UInt64 movesA2 = 0x800000;
			UInt64 movesD2 = 0x0;

			var bbMovesA1 = pawn.GetMovesFromPosition(Columns.ColA, Rows.Row1, allied, enemies);
			var bbMovesB1 = pawn.GetMovesFromPosition(Columns.ColB, Rows.Row1, allied, enemies);
			var bbMovesC2 = pawn.GetMovesFromPosition(Columns.ColC, Rows.Row2, allied, enemies);
			var bbMovesD4 = pawn.GetMovesFromPosition(Columns.ColD, Rows.Row4, allied, enemies);
			var bbMovesA8 = pawn.GetMovesFromPosition(Columns.ColA, Rows.Row8, allied, enemies);
			var bbMovesH5 = pawn.GetMovesFromPosition(Columns.ColH, Rows.Row5, allied, enemies);
			var bbMovesH6 = pawn.GetMovesFromPosition(Columns.ColH, Rows.Row6, allied, enemies);
			var bbMovesH8 = pawn.GetMovesFromPosition(Columns.ColH, Rows.Row8, allied, enemies);
			var bbMovesH1 = pawn.GetMovesFromPosition(Columns.ColH, Rows.Row1, allied, enemies);
			var bbMovesF7 = pawn.GetMovesFromPosition(Columns.ColF, Rows.Row7, allied, enemies);
			var bbMovesC7 = pawn.GetMovesFromPosition(Columns.ColC, Rows.Row7, allied, enemies);
			var bbMovesA2 = pawn.GetMovesFromPosition(Columns.ColA, Rows.Row2, allied, enemies);
			var bbMovesD2 = pawn.GetMovesFromPosition(Columns.ColD, Rows.Row2, allied, enemies);

			Assert.AreEqual(movesA1, bbMovesA1, "a1-a2");
			Assert.AreEqual(movesB1, bbMovesB1, "b1-b2");
			Assert.AreEqual(movesC2, bbMovesC2, "c2");
			Assert.AreEqual(movesD4, bbMovesD4, "d4-d5");
			Assert.AreEqual(movesA8, bbMovesA8, "a8");
			Assert.AreEqual(movesH5, bbMovesH5, "h5*g6");
			Assert.AreEqual(movesH6, bbMovesH6, "h6");
			Assert.AreEqual(movesH8, bbMovesH8, "h8");
			Assert.AreEqual(movesH1, bbMovesH1, "h1");
			Assert.AreEqual(movesF7, bbMovesF7, "f7");
			Assert.AreEqual(movesC7, bbMovesC7, "c7");
			Assert.AreEqual(movesA2, bbMovesA2, "a2");
			Assert.AreEqual(movesD2, bbMovesD2, "d2");
		}

		[TestMethod]
		public void P_CapturesTest()
		{
			var pawn = new Pawn();
			pawn.Color = PieceColors.White;

			UInt64 movesA1 = (ulong)Math.Pow(2, (int)Square.B2);
			UInt64 movesB1 = 0x0;
			UInt64 movesC2 = (ulong)Math.Pow(2, (int)Square.D3);
			UInt64 movesD4 = 0x0;
			UInt64 movesA8 = 0x0;
			UInt64 movesH5 = (ulong)Math.Pow(2, (int)Square.G6);
			UInt64 movesH6 = 0x0;
			UInt64 movesH8 = 0x0;
			UInt64 movesH1 = 0x0;
			UInt64 movesF7 = 0x0;
			UInt64 movesC7 = (ulong)Math.Pow(2, (int)Square.D8);
			UInt64 movesA2 = 0x0;
			UInt64 movesD2 = 0x0;
			UInt64 movesC1 = (ulong)Math.Pow(2, (int)Square.B2) | (ulong)Math.Pow(2, (int)Square.D2);

			var bbMovesA1 = pawn.GetCapturesFromPosition(Columns.ColA, Rows.Row1, allied, enemies);
			var bbMovesB1 = pawn.GetCapturesFromPosition(Columns.ColB, Rows.Row1, allied, enemies);
			var bbMovesC2 = pawn.GetCapturesFromPosition(Columns.ColC, Rows.Row2, allied, enemies);
			var bbMovesD4 = pawn.GetCapturesFromPosition(Columns.ColD, Rows.Row4, allied, enemies);
			var bbMovesA8 = pawn.GetCapturesFromPosition(Columns.ColA, Rows.Row8, allied, enemies);
			var bbMovesH5 = pawn.GetCapturesFromPosition(Columns.ColH, Rows.Row5, allied, enemies);
			var bbMovesH6 = pawn.GetCapturesFromPosition(Columns.ColH, Rows.Row6, allied, enemies);
			var bbMovesH8 = pawn.GetCapturesFromPosition(Columns.ColH, Rows.Row8, allied, enemies);
			var bbMovesH1 = pawn.GetCapturesFromPosition(Columns.ColH, Rows.Row1, allied, enemies);
			var bbMovesF7 = pawn.GetCapturesFromPosition(Columns.ColF, Rows.Row7, allied, enemies);
			var bbMovesC7 = pawn.GetCapturesFromPosition(Columns.ColC, Rows.Row7, allied, enemies);
			var bbMovesA2 = pawn.GetCapturesFromPosition(Columns.ColA, Rows.Row2, allied, enemies);
			var bbMovesD2 = pawn.GetCapturesFromPosition(Columns.ColD, Rows.Row2, allied, enemies);
			var bbMovesC1 = pawn.GetCapturesFromPosition(Columns.ColC, Rows.Row1, allied, enemies);

			Assert.AreEqual(movesA1, bbMovesA1, "a1*b2");
			Assert.AreEqual(movesB1, bbMovesB1, "b1***");
			Assert.AreEqual(movesC2, bbMovesC2, "c2*d3");
			Assert.AreEqual(movesD4, bbMovesD4, "d4***");
			Assert.AreEqual(movesA8, bbMovesA8, "a8***");
			Assert.AreEqual(movesH5, bbMovesH5, "h5*g6");
			Assert.AreEqual(movesH6, bbMovesH6, "h6***");
			Assert.AreEqual(movesH8, bbMovesH8, "h8***");
			Assert.AreEqual(movesH1, bbMovesH1, "h1***");
			Assert.AreEqual(movesF7, bbMovesF7, "f7***");
			Assert.AreEqual(movesC7, bbMovesC7, "c7*d8");
			Assert.AreEqual(movesA2, bbMovesA2, "a2***");
			Assert.AreEqual(movesD2, bbMovesD2, "d2***");
			Assert.AreEqual(movesC1, bbMovesC1, "c1*b2 | c1*d2");
		}

		public void P_IsAttackingSquare() {

			var pawn = new Pawn();
			Assert.IsTrue(pawn.IsAttackingSquare(Square.B2, Square.C3, allied, enemies));
			Assert.IsFalse(pawn.IsAttackingSquare(Square.A1, Square.C2, allied, enemies));
			Assert.IsFalse(pawn.IsAttackingSquare(Square.A4, Square.H4, allied, enemies));
		}
	}
}
