using Microsoft.VisualStudio.TestTools.UnitTesting;
using SP.Core;
using SP.Engine;
using SP.Engine.Pieces;
using System;
using System.Collections.Generic;
using BitBoard = System.UInt64;

namespace SP.Engine.Pieces
{
	[TestClass]
	[TestCategory("Engine.Pieces.Queen")]
	public class QueenMovesTests
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
		public void Q_MoveInABlankBoard()
		{

			var piece = new Queen();

			UInt64 movesA1 = 0x8182848890a0c07f;
			UInt64 movesB1 = 0x404142444850e0bf;
			UInt64 movesC2 = 0x20212224a870df70;
			UInt64 movesD4 = 0x11925438ef385492;
			UInt64 movesA8 = 0x7fc0a09088848281;
			UInt64 movesH6 = 0x0503fe0305091121;
			UInt64 movesH8 = 0xfe03050911214181;
			UInt64 movesH1 = 0x81412111090503fe;

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
		public void Q_MoveInOccupiedBoard() {

			var piece = new Queen();

			UInt64 expA1 = 0x8080c07e;
			UInt64 expB1 = 0xc0be;
			UInt64 expC2 = 0x20305070;
			UInt64 expD4 = 0x01121418ef384400;
			UInt64 expA8 = 0xc0a09088000000;
			UInt64 expH6 = 0x0503020301010100;
			UInt64 expH8 = 0x1e03050800000000;
			UInt64 expH1 = 0x10101010302;

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
		public void Q_CapturesTest()
		{

			var piece = new Queen();

			ulong expec1 = (ulong)(SquareBits.B2 | SquareBits.D3 | SquareBits.D2);
			ulong moves1 = piece.GetCapturesFromPosition(Columns.ColC, Rows.Row3, g);

			Assert.AreEqual(expec1, moves1);

		}

		[TestMethod]
		public void Q_IsAttackingSquare() {

			var piece = new Queen();
			Assert.IsTrue (piece.IsAttackingSquare(Square.B2, Square.C3, g), $"B2 -> C3");
			Assert.IsFalse(piece.IsAttackingSquare(Square.A1, Square.C2, g), $"A1 -> C2");
			Assert.IsFalse(piece.IsAttackingSquare(Square.A4, Square.H4, g), $"A4 -> H4");
			Assert.IsTrue (piece.IsAttackingSquare(Square.D4, Square.H4, g), $"D4 -> H4");
			Assert.IsTrue (piece.IsAttackingSquare(Square.F6, Square.B6, g), $"F6 -> B6");
			Assert.IsTrue (piece.IsAttackingSquare(Square.A8, Square.A4, g), $"A8 -> A4");
			Assert.IsFalse(piece.IsAttackingSquare(Square.A8, Square.A3, g), $"A8 -> A3");
			Assert.IsTrue (piece.IsAttackingSquare(Square.A1, Square.A4, g), $"A1 -> A4");
			Assert.IsFalse(piece.IsAttackingSquare(Square.A1, Square.A8, g), $"A1 -> A8");
			Assert.IsFalse(piece.IsAttackingSquare(Square.C3, Square.B5, g), $"C3 -> B5");
			Assert.IsTrue (piece.IsAttackingSquare(Square.C1, Square.C2, g), $"C1 -> C2");
		}
	}
}
