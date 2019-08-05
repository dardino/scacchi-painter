using Microsoft.VisualStudio.TestTools.UnitTesting;
using SP.Core;
using SP.Engine;
using SP.Engine.Pieces;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using BitBoard = System.UInt64;

namespace SP.Engine.Pieces
{
	[TestClass]
	[TestCategory("Engine.Pieces.Horse")]
	public class HorseMovesTests
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
		[Priority(1)]
		public void H_MoveInABlankBoard()
		{

			var piece = new Horse();

			UInt64 movesA1 = (ulong)(SquareBits.B3 | SquareBits.C2);
			UInt64 movesB1 = (ulong)(SquareBits.A3 | SquareBits.C3 | SquareBits.D2);
			UInt64 movesC2 = (ulong)(SquareBits.A1 | SquareBits.A3 | SquareBits.B4 | SquareBits.D4 | SquareBits.E3 | SquareBits.E1);
			UInt64 movesD4 = (ulong)(SquareBits.B3 | SquareBits.B5 | SquareBits.C2 | SquareBits.C6 | SquareBits.E2 | SquareBits.E6 | SquareBits.F3 | SquareBits.F5);
			UInt64 movesA8 = (ulong)(SquareBits.B6 | SquareBits.C7);
			UInt64 movesH6 = (ulong)(SquareBits.F5 | SquareBits.F7 | SquareBits.G4 | SquareBits.G8);
			UInt64 movesH8 = (ulong)(SquareBits.F7 | SquareBits.G6);
			UInt64 movesH1 = (ulong)(SquareBits.F2 | SquareBits.G3);

			var sp = Stopwatch.StartNew();
			var bbMovesA1 = piece.GetMovesFromPosition(Columns.ColA, Rows.Row1);
			var bbMovesB1 = piece.GetMovesFromPosition(Columns.ColB, Rows.Row1);
			var bbMovesC2 = piece.GetMovesFromPosition(Columns.ColC, Rows.Row2);
			var bbMovesD4 = piece.GetMovesFromPosition(Columns.ColD, Rows.Row4);
			var bbMovesA8 = piece.GetMovesFromPosition(Columns.ColA, Rows.Row8);
			var bbMovesH6 = piece.GetMovesFromPosition(Columns.ColH, Rows.Row6);
			var bbMovesH8 = piece.GetMovesFromPosition(Columns.ColH, Rows.Row8);
			var bbMovesH1 = piece.GetMovesFromPosition(Columns.ColH, Rows.Row1);
			sp.Stop();

			Console.WriteLine($"tempo trascorso per il calcolo delle mosse di cavallo: {sp.Elapsed}");

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
		[Priority(1)]
		public void H_MoveInOccupiedBoard() {

			var piece = new Horse();

			UInt64 expA1 = 0ul;
			UInt64 expB1 = (ulong)(SquareBits.A3 | SquareBits.C3 | SquareBits.D2);
			UInt64 expC2 = (ulong)(SquareBits.A1 | SquareBits.A3 | SquareBits.B4 | SquareBits.E3 | SquareBits.E1);
			UInt64 expD4 = (ulong)(SquareBits.B5 | SquareBits.C6 | SquareBits.E2 | SquareBits.E6);
			UInt64 expA8 = (ulong)(SquareBits.B6 | SquareBits.C7);
			UInt64 expH6 = (ulong)(SquareBits.G4 | SquareBits.G8);
			UInt64 expH8 = (ulong)(SquareBits.G6);
			UInt64 expH1 = (ulong)(SquareBits.F2 | SquareBits.G3);

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
		[Priority(1)]
		public void H_CapturesTest()
		{

			var piece = new Horse();

			ulong expec1 = (ulong)(SquareBits.A4 | SquareBits.B5);
			ulong moves1 = piece.GetCapturesFromPosition(Columns.ColC, Rows.Row3, g);

			Assert.AreEqual(expec1, moves1);

		}

		[TestMethod]
		[Priority(1)]
		public void H_IsAttackingSquare() {

			var piece = new Horse();
			Assert.IsFalse(piece.IsAttackingSquare(Square.B2, Square.C3, g), $"B2 -> C3");
			Assert.IsTrue (piece.IsAttackingSquare(Square.A1, Square.C2, g), $"A1 -> C2");
			Assert.IsFalse(piece.IsAttackingSquare(Square.A4, Square.H4, g), $"A4 -> H4");
			Assert.IsFalse(piece.IsAttackingSquare(Square.D4, Square.H4, g), $"D4 -> H4");
			Assert.IsFalse(piece.IsAttackingSquare(Square.F6, Square.B6, g), $"F6 -> B6");
			Assert.IsFalse(piece.IsAttackingSquare(Square.A8, Square.A4, g), $"A8 -> A4");
			Assert.IsFalse(piece.IsAttackingSquare(Square.A8, Square.A3, g), $"A8 -> A3");
			Assert.IsFalse(piece.IsAttackingSquare(Square.A1, Square.A4, g), $"A1 -> A4");
			Assert.IsFalse(piece.IsAttackingSquare(Square.A1, Square.A8, g), $"A1 -> A8");
			Assert.IsTrue (piece.IsAttackingSquare(Square.C3, Square.B5, g), $"C3 -> B5");
		}
	}
}
