using Microsoft.VisualStudio.TestTools.UnitTesting;
using SP.Engine;
using SP.Engine.Pieces;
using System;
using System.Collections.Generic;
using System.Text;

namespace SP.Core.Engine.Pieces
{
	[TestClass]
	[TestCategory("Engine.Pieces.Rock")]
	public class RockMovesTests
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
		public void R_MoveInABlankBoard()
		{

			var piece = new Rock();

			UInt64 movesB1 = 0x40404040404040bf;
			UInt64 movesA1 = 0x808080808080807f;
			UInt64 movesC2 = 0x202020202020df20;
			UInt64 movesD4 = 0x10101010ef101010;
			UInt64 movesA8 = 0x7f80808080808080;
			UInt64 movesH6 = 0x0101fe0101010101;
			UInt64 movesH8 = 0xfe01010101010101;
			UInt64 movesH1 = 0x01010101010101fe;

			var bbMovesA1 = piece.GetMovesFromPosition(Columns.ColA, Rows.Row1);
			var bbMovesB1 = piece.GetMovesFromPosition(Columns.ColB, Rows.Row1);
			var bbMovesC2 = piece.GetMovesFromPosition(Columns.ColC, Rows.Row2);
			var bbMovesD4 = piece.GetMovesFromPosition(Columns.ColD, Rows.Row4);
			var bbMovesA8 = piece.GetMovesFromPosition(Columns.ColA, Rows.Row8);
			var bbMovesH6 = piece.GetMovesFromPosition(Columns.ColH, Rows.Row6);
			var bbMovesH8 = piece.GetMovesFromPosition(Columns.ColH, Rows.Row8);
			var bbMovesH1 = piece.GetMovesFromPosition(Columns.ColH, Rows.Row1);

			Assert.AreEqual(bbMovesA1, movesA1, "A1");
			Assert.AreEqual(bbMovesB1, movesB1, "B1");
			Assert.AreEqual(bbMovesC2, movesC2, "C2");
			Assert.AreEqual(bbMovesD4, movesD4, "D4");
			Assert.AreEqual(bbMovesA8, movesA8, "A8");
			Assert.AreEqual(bbMovesH6, movesH6, "H6");
			Assert.AreEqual(bbMovesH8, movesH8, "H8");
			Assert.AreEqual(bbMovesH1, movesH1, "H1");

		}

		[TestMethod]
		public void R_MoveInOccupiedBoard() {

			var piece = new Rock();

			UInt64 expA1 = 0x8080807e;
			UInt64 expB1 = 0x40be;
			UInt64 expC2 = 0x20205020;
			UInt64 expD4 = 0x101010ef100000;
			UInt64 expA8 = 0x80808080000000;
			UInt64 expH6 = 0x101020101010100;
			UInt64 expH8 = 0x1e01010000000000;
			UInt64 expH1 = 0x10101010102;

			var movA1 = piece.GetMovesFromPosition(Columns.ColA, Rows.Row1, allied, enemies);
			var movB1 = piece.GetMovesFromPosition(Columns.ColB, Rows.Row1, allied, enemies);
			var movC2 = piece.GetMovesFromPosition(Columns.ColC, Rows.Row2, allied, enemies);
			var movD4 = piece.GetMovesFromPosition(Columns.ColD, Rows.Row4, allied, enemies);
			var movA8 = piece.GetMovesFromPosition(Columns.ColA, Rows.Row8, allied, enemies);
			var movH6 = piece.GetMovesFromPosition(Columns.ColH, Rows.Row6, allied, enemies);
			var movH8 = piece.GetMovesFromPosition(Columns.ColH, Rows.Row8, allied, enemies);
			var movH1 = piece.GetMovesFromPosition(Columns.ColH, Rows.Row1, allied, enemies);

			Assert.AreEqual(expA1, movA1, "A1");
			Assert.AreEqual(expB1, movB1, "B1");
			Assert.AreEqual(expC2, movC2, "C2");
			Assert.AreEqual(expD4, movD4, "D4");
			Assert.AreEqual(expA8, movA8, "A8");
			Assert.AreEqual(expH6, movH6, "H6");
			Assert.AreEqual(expH8, movH8, "H8");
			Assert.AreEqual(expH1, movH1, "H1");

		}

		[TestMethod]
		public void R_CapturesTest()
		{

			var piece = new Rock();

			ulong expec1 = 0x100000;
			ulong moves1 = piece.GetCapturesFromPosition(Columns.ColC, Rows.Row3, allied, enemies);

			Assert.AreEqual(expec1, moves1);

		}

		[TestMethod]
		public void R_IsAttackingSquare() {

			var piece = new Rock();
			Assert.IsFalse(piece.IsAttackingSquare(Square.B2, Square.C3, allied, enemies), $"B2 -> C3");
			Assert.IsFalse(piece.IsAttackingSquare(Square.A1, Square.C2, allied, enemies), $"A1 -> C2");
			Assert.IsFalse(piece.IsAttackingSquare(Square.A4, Square.H4, allied, enemies), $"A4 -> H4");
			Assert.IsTrue (piece.IsAttackingSquare(Square.D4, Square.H4, allied, enemies), $"D4 -> H4");
			Assert.IsTrue (piece.IsAttackingSquare(Square.F6, Square.B6, allied, enemies), $"F6 -> B6");
			Assert.IsTrue (piece.IsAttackingSquare(Square.A8, Square.A4, allied, enemies), $"A8 -> A4");
			Assert.IsFalse(piece.IsAttackingSquare(Square.A8, Square.A3, allied, enemies), $"A8 -> A3");
			Assert.IsTrue (piece.IsAttackingSquare(Square.A1, Square.A4, allied, enemies), $"A1 -> A4");
			Assert.IsFalse(piece.IsAttackingSquare(Square.A1, Square.A8, allied, enemies), $"A1 -> A8");
		}
	}
}
