using Microsoft.VisualStudio.TestTools.UnitTesting;
using SP.Engine;
using SP.Engine.Pieces;
using System;
using System.Collections.Generic;
using System.Text;

namespace SP.Core.Engine.Pieces
{
	[TestClass]
	[TestCategory("Engine.Pieces.King")]
	public class KingMovesTests
	{
		GameState g = new GameState
		{
			// WHITE:                                BLACK:
			// ---------------------------------     ---------------------------------
			// | X | X |   |   |   |   |   |   |     |   |   | X | X |   |   |   |   |
			// ---------------------------------     ---------------------------------
			// |   |   |   |   |   | X |   |   |     |   |   |   | X | X |   |   |   |
			// ---------------------------------     ---------------------------------
			// |   |   |   |   |   |   |   |   |     |   | X |   |   |   |   | X | X |
			// ---------------------------------     ---------------------------------
			// |   |   | X |   |   | X |   |   |     |   | X |   |   |   |   | X |   |
			// ---------------------------------     ---------------------------------
			// |   |   |   | X |   |   |   |   |     | X |   |   |   |   |   |   |   |
			// ---------------------------------     ---------------------------------
			// |   | X |   |   |   | X |   |   |     |   |   |   | X |   |   |   |   |
			// ---------------------------------     ---------------------------------
			// |   |   | X |   |   |   |   |   |     |   | X |   | X |   | X |   |   |
			// ---------------------------------     ---------------------------------
			// |   |   |   |   |   |   |   | X |     |   |   |   |   |   |   | X |   |
			// ---------------------------------     --------------------------------- 
			Allied = 0xC004002410442001,              Enemies = 0x3018434280105402
		};




		[TestMethod]
		public void K_MoveInABlankBoard()
		{

			var king = new King();
			UInt64 movesB1 = 0x000000000000E0A0;
			UInt64 movesB2 = 0x0000000000e0a0e0;
			UInt64 movesA1 = 0x000000000000C040;
			UInt64 movesC2 = 0x0000000000705070;
			UInt64 movesD4 = 0x0000003828380000;
			UInt64 movesA8 = 0x40C0000000000000;
			UInt64 movesH6 = 0x0003020300000000;
			UInt64 movesH8 = 0x0203000000000000;
			UInt64 movesH1 = 0x0000000000000302;

			var bbMovesA1 = king.GetMovesFromPosition(Columns.ColA, Rows.Row1);
			var bbMovesB1 = king.GetMovesFromPosition(Columns.ColB, Rows.Row1);
			var bbMovesB2 = king.GetMovesFromPosition(Columns.ColB, Rows.Row2);
			var bbMovesC2 = king.GetMovesFromPosition(Columns.ColC, Rows.Row2);
			var bbMovesD4 = king.GetMovesFromPosition(Columns.ColD, Rows.Row4);
			var bbMovesA8 = king.GetMovesFromPosition(Columns.ColA, Rows.Row8);
			var bbMovesH6 = king.GetMovesFromPosition(Columns.ColH, Rows.Row6);
			var bbMovesH8 = king.GetMovesFromPosition(Columns.ColH, Rows.Row8);
			var bbMovesH1 = king.GetMovesFromPosition(Columns.ColH, Rows.Row1);

			Assert.AreEqual(bbMovesA1, movesA1);
			Assert.AreEqual(bbMovesB1, movesB1);
			Assert.AreEqual(bbMovesB2, movesB2);
			Assert.AreEqual(bbMovesC2, movesC2);
			Assert.AreEqual(bbMovesD4, movesD4);
			Assert.AreEqual(bbMovesA8, movesA8);
			Assert.AreEqual(bbMovesH6, movesH6);
			Assert.AreEqual(bbMovesH8, movesH8);
			Assert.AreEqual(bbMovesH1, movesH1);

		}

		[TestMethod]
		public void K_MoveInOccupiedBoard() {

			var king = new King();

			ulong expec1 = 0x60105000;
			ulong moves1 = king.GetMovesFromPosition(Columns.ColC, Rows.Row3, g);
			ulong expec2 = 0x60105000;
			ulong moves2 = king.GetMovesFromPosition(Square.C3, g);
			ulong expec3 = 0xa080e0;
			ulong moves3 = king.GetMovesFromPosition(Square.B2, g);
			ulong expec4 = 0x305070;
			ulong moves4 = king.GetMovesFromPosition(Square.C2, g);


			Assert.AreEqual(expec1, moves1, "c3");
			Assert.AreEqual(expec2, moves2, "c3");
			Assert.AreEqual(expec3, moves3, "b2");
			Assert.AreEqual(expec4, moves4, "c2");

		}

		[TestMethod]
		public void K_CapturesTest()
		{

			var king = new King();

			ulong expec1 = 0x105000;
			ulong moves1 = king.GetCapturesFromPosition(Columns.ColC, Rows.Row3, g);

			Assert.AreEqual(expec1, moves1);

		}

		[TestMethod]
		public void K_IsAttackingSquare() {

			var king = new King();
			Assert.IsTrue(king.IsAttackingSquare(Square.B2, Square.C3,  g));
			Assert.IsFalse(king.IsAttackingSquare(Square.A1, Square.C2, g));
			Assert.IsFalse(king.IsAttackingSquare(Square.A4, Square.H4, g));
		}

		[TestMethod]
		public void K_FreeCastling() {
			var wk = new King() { Color = PieceColors.White };
			var bk = new King() { Color = PieceColors.Black };
			var gs1 = new GameState {
				Allied = (ulong)(SquareBits.A1 | SquareBits.E1 | SquareBits.H1 | SquareBits.A2 /*pedone*/),
				Enemies = (ulong)(SquareBits.A8 | SquareBits.E8 | SquareBits.H8 | SquareBits.H7),
				CastlingAllowed = new bool[] { true, true, true, true },
				AlliedRocks = (ulong)(SquareBits.A1 | SquareBits.H8)
			};
			var expec1 = (ulong)(SquareBits.C1 | SquareBits.D1 | SquareBits.F1 | SquareBits.G1 | SquareBits.D2 | SquareBits.E2 | SquareBits.F2);
			var expec2 = (ulong)(SquareBits.C8 | SquareBits.D8 | SquareBits.F8 | SquareBits.G8 | SquareBits.D7 | SquareBits.E7 | SquareBits.F7);

			var moves1 = wk.GetMovesFromPosition(Square.E1, gs1);
			var moves2 = bk.GetMovesFromPosition(Square.E8, gs1);

			Assert.AreEqual(expec1, moves1, "WK E1 --> All Moves + All Castling");
			Assert.AreEqual(expec2, moves2, "BK E8 --> All Moves + All Castling");
		}

		[TestMethod]
		public void K_NoCastling1()
		{
			var wk = new King() { Color = PieceColors.White };
			var bk = new King() { Color = PieceColors.Black };
			var gs2 = new GameState // rocks under check
			{
				Allied = (ulong)(SquareBits.A1 | SquareBits.E1 | SquareBits.H1),
				Enemies = (ulong)(SquareBits.A8 | SquareBits.E8 | SquareBits.H8),
				CastlingAllowed = new bool[] { true, true, true, true },
				AlliedRocks = (ulong)(SquareBits.A1 | SquareBits.H8)
			};
			var expec3 = (ulong)(SquareBits.D1 | SquareBits.F1 | SquareBits.D2 | SquareBits.E2 | SquareBits.F2);
			var expec4 = (ulong)(SquareBits.D8 | SquareBits.F8 | SquareBits.D7 | SquareBits.E7 | SquareBits.F7);

			var moves3 = wk.GetMovesFromPosition(Square.E1, gs2);
			var moves4 = bk.GetMovesFromPosition(Square.E8, gs2);

			Assert.AreEqual(expec3, moves3, "WK E1 --> All Moves + NO Castling (R under check)");
			Assert.AreEqual(expec4, moves4, "BK E8 --> All Moves + NO Castling (R under check)");
		}


		[TestMethod]
		public void K_NoCastling2()
		{
			var wk = new King() { Color = PieceColors.White };
			var bk = new King() { Color = PieceColors.Black };
			var gs2 = new GameState // rocks under check
			{
				Allied = (ulong)(SquareBits.A1 | SquareBits.E1 | SquareBits.H1 | SquareBits.H6), // metto un alfiere bianco in H6
				Enemies = (ulong)(SquareBits.A3 | SquareBits.A8 | SquareBits.E8 | SquareBits.H8), // e uno nero in A3
				CastlingAllowed = new bool[] { true, true, true, true },
				AlliedRocks = (ulong)(SquareBits.A1 | SquareBits.H8),
				UnderAttackCells = BitBoard.fromRowBytes(
					0b00100010,
					0b00000000,
					0b00000000,
					0b00000000,
					0b00000000,
					0b00000000,
					0b00000000,
					0b00100010
					)
			};
			var expec3 = (ulong)(SquareBits.D1 | SquareBits.F1 | SquareBits.D2 | SquareBits.E2 | SquareBits.F2);
			var expec4 = (ulong)(SquareBits.D8 | SquareBits.F8 | SquareBits.D7 | SquareBits.E7 | SquareBits.F7);

			var moves3 = wk.GetMovesFromPosition(Square.E1, gs2);
			var moves4 = bk.GetMovesFromPosition(Square.E8, gs2);

			Assert.AreEqual(expec3, moves3, "WK E1 --> All Moves + NO Castling (arrival square under check)");
			Assert.AreEqual(expec4, moves4, "BK E8 --> All Moves + NO Castling (arrival square under check)");
		}
	}
}
