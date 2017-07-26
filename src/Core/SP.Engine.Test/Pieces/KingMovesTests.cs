using Microsoft.VisualStudio.TestTools.UnitTesting;
using SP.Engine;
using System;
using System.Collections.Generic;
using System.Text;

namespace SP.Core.Engine.Pieces
{
	[TestClass]
	[TestCategory("Engine.Pieces.King")]
	public class KingMovesTests
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
		public void K_MoveInABlankBoard()
		{

			var king = new Core.Pieces.King();
			UInt64 movesB1 = 0x000000000000E0A0;
			UInt64 movesA1 = 0x000000000000C040;
			UInt64 movesC2 = 0x0000000000705070;
			UInt64 movesD4 = 0x0000003828380000;
			UInt64 movesA8 = 0x40C0000000000000;
			UInt64 movesH6 = 0x0003020300000000;
			UInt64 movesH8 = 0x0203000000000000;
			UInt64 movesH1 = 0x0000000000000302;

			var bbMovesA1 = king.GetMovesFromPosition(Columns.ColA, Rows.Row1);
			var bbMovesB1 = king.GetMovesFromPosition(Columns.ColB, Rows.Row1);
			var bbMovesC2 = king.GetMovesFromPosition(Columns.ColC, Rows.Row2);
			var bbMovesD4 = king.GetMovesFromPosition(Columns.ColD, Rows.Row4);
			var bbMovesA8 = king.GetMovesFromPosition(Columns.ColA, Rows.Row8);
			var bbMovesH6 = king.GetMovesFromPosition(Columns.ColH, Rows.Row6);
			var bbMovesH8 = king.GetMovesFromPosition(Columns.ColH, Rows.Row8);
			var bbMovesH1 = king.GetMovesFromPosition(Columns.ColH, Rows.Row1);

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
		public void K_MoveInOccupiedBoard() {

			var king = new Core.Pieces.King();

			ulong expec1 = 0x60105000;
			ulong moves1 = king.GetMovesFromPosition(Columns.ColC, Rows.Row3, allied, enemies);
			ulong expec2 = 0x60105000;
			ulong moves2 = king.GetMovesFromPosition(Square.C3, allied, enemies);

			Assert.AreEqual(expec1, moves1);
			Assert.AreEqual(expec2, moves2);
		}

		[TestMethod]
		public void K_CapturesTest()
		{

			var king = new Core.Pieces.King();

			ulong expec1 = 0x105000;
			ulong moves1 = king.GetCapturesFromPosition(Columns.ColC, Rows.Row3, allied, enemies);

			Assert.AreEqual(expec1, moves1);

		}

		public void K_IsAttackingSquare() {

			var king = new Core.Pieces.King();
			Assert.IsTrue(king.IsAttackingSquare(Square.B2, Square.C3, allied, enemies));
			Assert.IsFalse(king.IsAttackingSquare(Square.A1, Square.C2, allied, enemies));
			Assert.IsFalse(king.IsAttackingSquare(Square.A4, Square.H4, allied, enemies));
		}
	}
}
