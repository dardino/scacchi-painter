using Microsoft.VisualStudio.TestTools.UnitTesting;
using SP.Engine;
using SP.Engine.Pieces;
using System;
using System.Collections.Generic;
using System.Text;

namespace SP.Core.Engine.Pieces
{
	[TestClass]
	[TestCategory("Engine.Pieces.Bishop")]
	public class BishopMovesTests
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
		// ---------------------------------   // ---------------------------------
		// |   |   | X | X |   |   |   |   |   // | 00| 02| 05| 09| 14| 20| 27| 35|
		// ---------------------------------   // ---------------------------------
		// |   |   |   | X | X |   |   |   |   // | 01| 04| 08| 13| 19| 26| 34| 42|
		// ---------------------------------   // ---------------------------------
		// |   | X |   |   |   |   | X | X |   // | 03| 07| 12| 18| 25| 33| 41| 48|
		// ---------------------------------   // ---------------------------------
		// |   | X |   |   |   |   | X |   |   // | 06| 11| 17| 24| 32| 40| 47| 53|
		// ---------------------------------   // ---------------------------------
		// | X |   |   |   |   |   |   |   |   // | 10| 16| 23| 31| 39| 46| 52| 57|
		// ---------------------------------   // ---------------------------------
		// |   |   |   | X |   |   |   |   |   // | 15| 22| 30| 38| 45| 51| 56| 60|
		// ---------------------------------   // ---------------------------------
		// |   | X |   | X |   | X |   |   |   // | 21| 29| 37| 44| 50| 55| 59| 62|
		// ---------------------------------   // ---------------------------------
		// |   |   |   |   |   |   | X |   |   // | 28| 36| 43| 49| 54| 58| 61| 63|
		// ---------------------------------   // ---------------------------------
		ulong enemies = 0x3018434280105402;


		[TestMethod]
		public void B_MoveInABlankBoard()
		{

			var piece = new Bishop();

			UInt64 movesB1 = 0x102040810a040;
			UInt64 movesA1 = 0x102040810204080;
			UInt64 movesC2 = 0x1020488502050;
			UInt64 movesD4 = 0x182442810284482;
			UInt64 movesA8 = 0x8040201008040201;
			UInt64 movesH6 = 0x402010204081020;
			UInt64 movesH8 = 0x102040810204080;
			UInt64 movesH1 = 0x8040201008040201;

			var bbMovesA1 = piece.GetMovesFromPosition(Columns.ColA, Rows.Row1);
			var bbMovesB1 = piece.GetMovesFromPosition(Columns.ColB, Rows.Row1);
			var bbMovesC2 = piece.GetMovesFromPosition(Columns.ColC, Rows.Row2);
			var bbMovesD4 = piece.GetMovesFromPosition(Columns.ColD, Rows.Row4);
			var bbMovesA8 = piece.GetMovesFromPosition(Columns.ColA, Rows.Row8);
			var bbMovesH6 = piece.GetMovesFromPosition(Columns.ColH, Rows.Row6);
			var bbMovesH8 = piece.GetMovesFromPosition(Columns.ColH, Rows.Row8);
			var bbMovesH1 = piece.GetMovesFromPosition(Columns.ColH, Rows.Row1);

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
		public void B_MoveInOccupiedBoard() {

			var piece = new Bishop();

			ulong expec1 = 0x60105000;
			ulong moves1 = piece.GetMovesFromPosition(Columns.ColC, Rows.Row3, allied, enemies);
			ulong expec2 = 0x60105000;
			ulong moves2 = piece.GetMovesFromPosition(Square.C3, allied, enemies);

			Assert.AreEqual(expec1, moves1);
			Assert.AreEqual(expec2, moves2);
		}

		[TestMethod]
		public void B_CapturesTest()
		{

			var piece = new Bishop();

			ulong expec1 = 0x105000;
			ulong moves1 = piece.GetCapturesFromPosition(Columns.ColC, Rows.Row3, allied, enemies);

			Assert.AreEqual(expec1, moves1);

		}

		public void B_IsAttackingSquare() {

			var piece = new Bishop();
			Assert.IsTrue(piece.IsAttackingSquare(Square.B2, Square.C3, allied, enemies));
			Assert.IsFalse(piece.IsAttackingSquare(Square.A1, Square.C2, allied, enemies));
			Assert.IsFalse(piece.IsAttackingSquare(Square.A4, Square.H4, allied, enemies));
		}
	}
}
