using Microsoft.VisualStudio.TestTools.UnitTesting;
using SP.Core;
using SP.Core.Utils;
using SP.Engine;
using SP.Engine.Pieces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using BitBoard = System.UInt64;

namespace SP.Engine.Pieces
{
	[TestClass]
	[TestCategory("Engine.Pieces.Pawn")]
	public class PawnMovesTests
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
		[Priority(1)]
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

			var bbMovesA1 = pawn.GetMovesFromPosition(Columns.ColA, Rows.Row1, g);
			var bbMovesB1 = pawn.GetMovesFromPosition(Columns.ColB, Rows.Row1, g);
			var bbMovesC2 = pawn.GetMovesFromPosition(Columns.ColC, Rows.Row2, g);
			var bbMovesD4 = pawn.GetMovesFromPosition(Columns.ColD, Rows.Row4, g);
			var bbMovesA8 = pawn.GetMovesFromPosition(Columns.ColA, Rows.Row8, g);
			var bbMovesH5 = pawn.GetMovesFromPosition(Columns.ColH, Rows.Row5, g);
			var bbMovesH6 = pawn.GetMovesFromPosition(Columns.ColH, Rows.Row6, g);
			var bbMovesH8 = pawn.GetMovesFromPosition(Columns.ColH, Rows.Row8, g);
			var bbMovesH1 = pawn.GetMovesFromPosition(Columns.ColH, Rows.Row1, g);
			var bbMovesF7 = pawn.GetMovesFromPosition(Columns.ColF, Rows.Row7, g);
			var bbMovesC7 = pawn.GetMovesFromPosition(Columns.ColC, Rows.Row7, g);
			var bbMovesA2 = pawn.GetMovesFromPosition(Columns.ColA, Rows.Row2, g);
			var bbMovesD2 = pawn.GetMovesFromPosition(Columns.ColD, Rows.Row2, g);

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

		[Priority(1)]
		[TestMethod]
		public void P_CapturesTest()
		{
			var pawn = new Pawn();
			pawn.Color = PieceColors.White;

			ulong movesA1 = Square.B2.ToSquareBits();
			ulong movesB1 = 0x0;
			ulong movesC2 = Square.D3.ToSquareBits();
			ulong movesD4 = 0x0;
			ulong movesA8 = 0x0;
			ulong movesH5 = Square.G6.ToSquareBits();
			ulong movesH6 = 0x0;
			ulong movesH8 = 0x0;
			ulong movesH1 = 0x0;
			ulong movesF7 = 0x0;
			ulong movesC7 = Square.D8.ToSquareBits();
			ulong movesA2 = 0x0;
			ulong movesD2 = 0x0;
			ulong movesC1 = Square.B2.ToSquareBits() | (ulong)Square.D2.ToSquareBits();

			var bbMovesA1 = pawn.GetCapturesFromPosition(Columns.ColA, Rows.Row1, g);
			var bbMovesB1 = pawn.GetCapturesFromPosition(Columns.ColB, Rows.Row1, g);
			var bbMovesC2 = pawn.GetCapturesFromPosition(Columns.ColC, Rows.Row2, g);
			var bbMovesD4 = pawn.GetCapturesFromPosition(Columns.ColD, Rows.Row4, g);
			var bbMovesA8 = pawn.GetCapturesFromPosition(Columns.ColA, Rows.Row8, g);
			var bbMovesH5 = pawn.GetCapturesFromPosition(Columns.ColH, Rows.Row5, g);
			var bbMovesH6 = pawn.GetCapturesFromPosition(Columns.ColH, Rows.Row6, g);
			var bbMovesH8 = pawn.GetCapturesFromPosition(Columns.ColH, Rows.Row8, g);
			var bbMovesH1 = pawn.GetCapturesFromPosition(Columns.ColH, Rows.Row1, g);
			var bbMovesF7 = pawn.GetCapturesFromPosition(Columns.ColF, Rows.Row7, g);
			var bbMovesC7 = pawn.GetCapturesFromPosition(Columns.ColC, Rows.Row7, g);
			var bbMovesA2 = pawn.GetCapturesFromPosition(Columns.ColA, Rows.Row2, g);
			var bbMovesD2 = pawn.GetCapturesFromPosition(Columns.ColD, Rows.Row2, g);
			var bbMovesC1 = pawn.GetCapturesFromPosition(Columns.ColC, Rows.Row1, g);

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

		[TestMethod]
		[Priority(1)]
		public void P_IsAttackingSquare() {

			var pawn = new Pawn();
			pawn.Color = PieceColors.White;
			Assert.IsTrue(pawn.IsAttackingSquare(Square.B2, Square.C3, g));
			Assert.IsFalse(pawn.IsAttackingSquare(Square.A1, Square.C2, g));
			Assert.IsFalse(pawn.IsAttackingSquare(Square.A4, Square.H4, g));
			Assert.IsTrue(pawn.IsAttackingSquare(Square.C5, Square.B6, g));
			Assert.IsTrue(pawn.IsAttackingSquare(Square.A7, Square.B8, g));
			Assert.IsFalse(pawn.IsAttackingSquare(Square.A7, Square.H8, g));
			Assert.IsFalse(pawn.IsAttackingSquare(Square.A7, Square.H7, g));
			Assert.IsTrue(pawn.IsAttackingSquare(Square.H7, Square.G8, g));
			Assert.IsFalse(pawn.IsAttackingSquare(Square.H7, Square.A8, g));
			Assert.IsFalse(pawn.IsAttackingSquare(Square.H7, Square.A7, g));
			pawn.Color = PieceColors.Black;
			Assert.IsTrue(pawn.IsAttackingSquare(Square.B2, Square.A1, g));
			Assert.IsTrue(pawn.IsAttackingSquare(Square.B2, Square.C1, g));
			Assert.IsTrue(pawn.IsAttackingSquare(Square.A2, Square.B1, g));
			Assert.IsFalse(pawn.IsAttackingSquare(Square.A2, Square.H1, g));
			Assert.IsFalse(pawn.IsAttackingSquare(Square.A2, Square.H2, g));
		}


		[TestMethod]
		[Priority(1)]
		public void P_EnPassantCaptures()
		{
			var tokenSource = new CancellationTokenSource();
			var board = BoardUtils.FromNotation("8/2p5/8/3Pp3/8/8/8/8");
			var gEP = GameStateStatic.FromBoard(board, tokenSource.Token);

			gEP.MoveTo = PieceColors.Black;
			GameStateStatic.ApplyMove(gEP, new HalfMove() {
				DestinationSquare = Square.C5,
				IsCapture = false,
				SourceSquare = Square.C7,
				SubSequentialMoves = null,
				Piece = board.GetPiece(Square.C7) as EnginePiece
			}, tokenSource.Token);

			var p = board.GetPiece(Square.D5) as Pawn;
			var actuals = p.GetMovesFromPosition(Square.D5, gEP);

			var expected = (ulong)BitBoardUtils.FromRowBytes(
				Row7: 0b00000000,
				Row6: 0b00110000
				);

			Assert.AreEqual(expected, actuals, "d5*c6 ep; d5-d6");
		}


		[TestMethod]
		[Priority(1)]
		public void P_WhitePromotions() {
			var tokenSource = new CancellationTokenSource();
			var gs1 = GameStateStatic.FromBoard(BoardUtils.FromNotation("8/2P5/8/8/8/8/8/8"), tokenSource.Token);
			var pawn = (Pawn)gs1.Board.GetPiece(Square.C7);
			var moves = pawn.GetMoves(Square.C7, gs1);
			Assert.AreEqual(4, moves.Count(), "4 promozioni: Q R B H");
		}

		[TestMethod]
		[Priority(1)]
		public void P_BlackPromotions()
		{
			var tokenSource = new CancellationTokenSource();
			var gs1 = GameStateStatic.FromBoard(BoardUtils.FromNotation("8/8/8/8/8/8/2p5/8"), tokenSource.Token);
			gs1.MoveTo = PieceColors.Black;
			GameStateStatic.UpdateGameState(gs1, tokenSource.Token);

			var pawn = (Pawn)gs1.Board.GetPiece(Square.C2);
			var moves = pawn.GetMoves(Square.C2, gs1);
			Assert.AreEqual(4, moves.Count(), "4 promozioni: Q R B H");
		}
	}
}
