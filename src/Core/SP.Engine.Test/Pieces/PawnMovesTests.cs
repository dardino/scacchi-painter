using Microsoft.VisualStudio.TestTools.UnitTesting;
using SP.Engine;
using System;
using System.Collections.Generic;
using System.Text;

namespace SP.Core.Engine.Pieces
{
	[TestClass]
	[TestCategory("Engine.Pieces.King")]
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

			var pawn = new Core.Pieces.Pawn();
			UInt64 movesA1 = 0x8000;
			UInt64 movesB1 = 0x4000;
			UInt64 movesC2 = 0x20200000;
			UInt64 movesD4 = 0x1000000000;
			UInt64 movesA8 = 0x0;
			UInt64 movesH6 = 0x1000000000000;
			UInt64 movesH8 = 0x0;
			UInt64 movesH1 = 0x100;

			var bbMovesA1 = pawn.GetMovesFromPosition(Columns.ColA, Rows.Row1);
			var bbMovesB1 = pawn.GetMovesFromPosition(Columns.ColB, Rows.Row1);
			var bbMovesC2 = pawn.GetMovesFromPosition(Columns.ColC, Rows.Row2);
			var bbMovesD4 = pawn.GetMovesFromPosition(Columns.ColD, Rows.Row4);
			var bbMovesA8 = pawn.GetMovesFromPosition(Columns.ColA, Rows.Row8);
			var bbMovesH6 = pawn.GetMovesFromPosition(Columns.ColH, Rows.Row6);
			var bbMovesH8 = pawn.GetMovesFromPosition(Columns.ColH, Rows.Row8);
			var bbMovesH1 = pawn.GetMovesFromPosition(Columns.ColH, Rows.Row1);

			Assert.AreEqual(bbMovesA1, movesA1);
			Assert.AreEqual(bbMovesB1, movesB1);
			Assert.AreEqual(bbMovesC2, movesC2);
			Assert.AreEqual(bbMovesD4, movesD4);
			Assert.AreEqual(bbMovesA8, movesA8);
			Assert.AreEqual(bbMovesH6, movesH6);
			Assert.AreEqual(bbMovesH8, movesH8);
			Assert.AreEqual(bbMovesH1, movesH1);

		}

		[TestMethod]
		public void P_MoveInOccupiedBoard() {

			var pawn = new Core.Pieces.Pawn();

			ulong expec1 = 0x60105000;
			ulong moves1 = pawn.GetMovesFromPosition(Columns.ColC, Rows.Row3, allied, enemies);
			ulong expec2 = 0x60105000;
			ulong moves2 = pawn.GetMovesFromPosition(Square.C3, allied, enemies);

			Assert.AreEqual(expec1, moves1);
			Assert.AreEqual(expec2, moves2);
		}

		[TestMethod]
		public void P_CapturesTest()
		{

			var pawn = new Core.Pieces.Pawn();

			ulong expec1 = 0x105000;
			ulong moves1 = pawn.GetCapturesFromPosition(Columns.ColC, Rows.Row3, allied, enemies);

			Assert.AreEqual(expec1, moves1);

		}

		public void P_IsAttackingSquare() {

			var pawn = new Core.Pieces.Pawn();
			Assert.IsTrue(pawn.IsAttackingSquare(Square.B2, Square.C3, allied, enemies));
			Assert.IsFalse(pawn.IsAttackingSquare(Square.A1, Square.C2, allied, enemies));
			Assert.IsFalse(pawn.IsAttackingSquare(Square.A4, Square.H4, allied, enemies));
		}
	}
}
