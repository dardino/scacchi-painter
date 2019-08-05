using Microsoft.VisualStudio.TestTools.UnitTesting;
using SP.Core;
using System;
using System.Collections.Generic;
using BitBoard = System.UInt64;

namespace SP.Engine.Pieces
{
	[TestClass]
	[TestCategory("Engine.Pieces.Rock")]
	public class RockMovesTests
	{
		GameState g = new GameState
		{
			BitBoardByColor = new Dictionary<PieceColors, BitBoard> {
				// WHITE:                                    BLACK:
				// ---------------------------------         ---------------------------------
				// | X | X |   |   |   |   |   |   |         |   |   | X | X |   |   |   |   |
				// ---------------------------------         ---------------------------------
				// |   |   |   |   |   | X |   |   |         |   |   |   | X | X |   |   |   |
				// ---------------------------------         ---------------------------------
				// |   |   |   |   |   |   |   |   |         |   | X |   |   |   |   | X | X |
				// ---------------------------------         ---------------------------------
				// |   |   | X |   |   | X |   |   |         |   | X |   |   |   |   | X |   |
				// ---------------------------------         ---------------------------------
				// |   |   |   | X |   |   |   |   |         | X |   |   |   |   |   |   |   |
				// ---------------------------------         ---------------------------------
				// |   | X |   |   |   | X |   |   |         |   |   |   | X |   |   |   |   |
				// ---------------------------------         ---------------------------------
				// |   |   | X |   |   |   |   |   |         |   | X |   | X |   | X |   |   |
				// ---------------------------------         ---------------------------------
				// |   |   |   |   |   |   |   | X |         |   |   |   |   |   |   | X |   |
				// ---------------------------------         --------------------------------- 
				{ PieceColors.White, 0xC004002410442001 }, {PieceColors.Black, 0x3018434280105402 }, { PieceColors.Neutral, 0 }
			}
		};


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

			var movA1 = piece.GetMovesFromPosition(Columns.ColA, Rows.Row1, g);
			var movB1 = piece.GetMovesFromPosition(Columns.ColB, Rows.Row1, g);
			var movC2 = piece.GetMovesFromPosition(Columns.ColC, Rows.Row2, g);
			var movD4 = piece.GetMovesFromPosition(Columns.ColD, Rows.Row4, g);
			var movA8 = piece.GetMovesFromPosition(Columns.ColA, Rows.Row8, g);
			var movH6 = piece.GetMovesFromPosition(Columns.ColH, Rows.Row6, g);
			var movH8 = piece.GetMovesFromPosition(Columns.ColH, Rows.Row8, g);
			var movH1 = piece.GetMovesFromPosition(Columns.ColH, Rows.Row1, g);

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
			ulong moves1 = piece.GetCapturesFromPosition(Columns.ColC, Rows.Row3, g);

			Assert.AreEqual(expec1, moves1);

		}

		[TestMethod]
		public void R_IsAttackingSquare() {

			var piece = new Rock();
			Assert.IsFalse(piece.IsAttackingSquare(Square.B2, Square.C3, g), $"B2 -> C3");
			Assert.IsFalse(piece.IsAttackingSquare(Square.A1, Square.C2, g), $"A1 -> C2");
			Assert.IsFalse(piece.IsAttackingSquare(Square.A4, Square.H4, g), $"A4 -> H4");
			Assert.IsTrue (piece.IsAttackingSquare(Square.D4, Square.H4, g), $"D4 -> H4");
			Assert.IsTrue (piece.IsAttackingSquare(Square.F6, Square.B6, g), $"F6 -> B6");
			Assert.IsTrue (piece.IsAttackingSquare(Square.A8, Square.A4, g), $"A8 -> A4");
			Assert.IsFalse(piece.IsAttackingSquare(Square.A8, Square.A3, g), $"A8 -> A3");
			Assert.IsTrue (piece.IsAttackingSquare(Square.A1, Square.A4, g), $"A1 -> A4");
			Assert.IsFalse(piece.IsAttackingSquare(Square.A1, Square.A8, g), $"A1 -> A8");
			Assert.IsTrue (piece.IsAttackingSquare(Square.C1, Square.C2, g), $"C1 -> C2");
		}
	}
}
