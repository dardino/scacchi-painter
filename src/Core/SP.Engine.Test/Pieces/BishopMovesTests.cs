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
		public void B_MoveInABlankBoard()
		{

			var piece = new Bishop();

			UInt64 movesB1 = 0x102040810a000;
			UInt64 movesA1 = 0x102040810204000;
			UInt64 movesC2 = 0x1020488500050;
			UInt64 movesD4 = 0x182442800284482;
			UInt64 movesA8 = 0x0040201008040201;
			UInt64 movesH6 = 0x402000204081020;
			UInt64 movesH8 = 0x2040810204080;
			UInt64 movesH1 = 0x8040201008040200;

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
		public void B_MoveInOccupiedBoard() {

			var piece = new Bishop();

			ulong expec1 = 0x8500040800000;
			ulong moves1 = piece.GetMovesFromPosition(Columns.ColC, Rows.Row5, g);
			ulong expec2 = 0x8040005000;
			ulong moves2 = piece.GetMovesFromPosition(Square.C3, g);

			Assert.AreEqual(expec1, moves1);
			Assert.AreEqual(expec2, moves2);
		}

		[TestMethod]
		public void B_CapturesTest()
		{

			var piece = new Bishop();

			ulong expec1 = 0x5000;
			ulong moves1 = piece.GetCapturesFromPosition(Columns.ColC, Rows.Row3, g);

			Assert.AreEqual(expec1, moves1);

		}

		[TestMethod]
		public void B_IsAttackingSquare() {

			var piece = new Bishop();
			Assert.IsTrue (piece.IsAttackingSquare(Square.A1, Square.B2, g), "a1-b2");
			Assert.IsTrue (piece.IsAttackingSquare(Square.B2, Square.C3, g), "b2-c3");
			Assert.IsFalse(piece.IsAttackingSquare(Square.A1, Square.C2, g), "a1-c2");
			Assert.IsFalse(piece.IsAttackingSquare(Square.A4, Square.H4, g), "a4-h4");

			var gg = GameState.FromBoard(Board.FromNotation("r3k2r/8/8/b7/B7/8/8/R3K2R"));
			Assert.IsTrue(piece.IsAttackingSquare(Square.A5, Square.E1, gg), "a5-e1");

			gg = GameState.FromBoard(Board.FromNotation("r3k2r/8/8/b7/B7/8/3P4/R3K2R"));
			Assert.IsFalse(piece.IsAttackingSquare(Square.A5, Square.E1, gg), "a5-e1");

		}
	}
}
