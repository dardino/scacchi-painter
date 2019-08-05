using Microsoft.VisualStudio.TestTools.UnitTesting;
using SP.Core;
using SP.Core.Utils;
using SP.Engine;
using SP.Engine.Pieces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading;
using BitBoard = System.UInt64;

namespace SP.Engine.Pieces
{
	[TestClass]
	[TestCategory("Engine.Pieces.King")]
	public class KingMovesTests
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
		[Priority(1)]
		public void K_MoveInOccupiedBoard()
		{

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
		[Priority(1)]
		public void K_CapturesTest()
		{

			var king = new King();

			ulong expec1 = 0x105000;
			ulong moves1 = king.GetCapturesFromPosition(Columns.ColC, Rows.Row3, g);

			Assert.AreEqual(expec1, moves1);

		}

		[TestMethod]
		[Priority(1)]
		public void K_IsAttackingSquare()
		{

			var king = new King();
			Assert.IsTrue(king.IsAttackingSquare(Square.B2, Square.C3, g));
			Assert.IsFalse(king.IsAttackingSquare(Square.A1, Square.C2, g));
			Assert.IsFalse(king.IsAttackingSquare(Square.A4, Square.H4, g));
		}

		[TestMethod]
		[Priority(1)]
		public void K_FreeCastling()
		{
			var wk = new King() { Color = PieceColors.White };
			var bk = new King() { Color = PieceColors.Black };
			var tokenSource = new CancellationTokenSource();
			var gs1 = GameStateStatic.FromBoard(BoardUtils.FromNotation("R6R/8/8/8/8/8/8/R6R"), tokenSource.Token);
			var expec1 = (ulong)BitBoardUtils.FromRowBytes(
				Row2: 0b00011100,
				Row1: 0b00110110
				);
			var expec2 = (ulong)BitBoardUtils.FromRowBytes(
				Row8: 0b00110110,
				Row7: 0b00011100
				);

			var moves1 = wk.GetMovesFromPosition(Square.E1, gs1);
			var moves2 = bk.GetMovesFromPosition(Square.E8, gs1);

			Assert.AreEqual(expec1, moves1, "WK E1 --> All Moves + All Castling");
			Assert.AreEqual(expec2, moves2, "BK E8 --> All Moves + All Castling");
		}

		[TestMethod]
		[Priority(1)]
		public void K_NoCastling1()
		{
			var tokenSource = new CancellationTokenSource();
			var wk = new King() { Color = PieceColors.White };
			var bk = new King() { Color = PieceColors.Black };
			var gs2 = GameStateStatic.FromBoard(BoardUtils.FromNotation("r3k2r/8/8/b7/B7/8/8/R3K2R"), tokenSource.Token);

			var expec3 = (ulong)(SquareBits.D1 | SquareBits.F1 | SquareBits.D2 | SquareBits.E2 | SquareBits.F2);
			var expec4 = (ulong)(SquareBits.D8 | SquareBits.F8 | SquareBits.D7 | SquareBits.E7 | SquareBits.F7);

			var moves3 = wk.GetMovesFromPosition(Square.E1, gs2);
			gs2.MoveTo = PieceColors.Black;
			GameStateStatic.UpdateGameState(gs2, tokenSource.Token);
			var moves4 = bk.GetMovesFromPosition(Square.E8, gs2);

			Assert.AreEqual(expec3, moves3, "WK E1 --> All Moves + NO Castling (King under check)");
			Assert.AreEqual(expec4, moves4, "BK E8 --> All Moves + NO Castling (King under check)");
		}

		[TestMethod]
		[Priority(1)]
		public void K_NoCastling2()
		{
			var wk = new King() { Color = PieceColors.White };
			var bk = new King() { Color = PieceColors.Black };
			var tokenSource = new CancellationTokenSource();
			var gs2 = GameStateStatic.FromBoard(BoardUtils.FromNotation("R6R/8/8/8/8/8/8/R6R"), tokenSource.Token);
			gs2.UnderAttackCells = BitBoardUtils.FromRowBytes(
					0b00100010,
					0b00000000,
					0b00000000,
					0b00000000,
					0b00000000,
					0b00000000,
					0b00000000,
					0b00100010
					);
			var expec3 = (ulong)(SquareBits.D1 | SquareBits.F1 | SquareBits.D2 | SquareBits.E2 | SquareBits.F2);
			var expec4 = (ulong)(SquareBits.D8 | SquareBits.F8 | SquareBits.D7 | SquareBits.E7 | SquareBits.F7);

			var moves3 = wk.GetMovesFromPosition(Square.E1, gs2);
			var moves4 = bk.GetMovesFromPosition(Square.E8, gs2);

			Assert.AreEqual(expec3, moves3, "WK E1 --> All Moves + NO Castling (arrival square under check)");
			Assert.AreEqual(expec4, moves4, "BK E8 --> All Moves + NO Castling (arrival square under check)");
		}

		[TestMethod]
		[Priority(1)]
		public void K_NoCastling3()
		{
			var wk = new King() { Color = PieceColors.White };
			var bk = new King() { Color = PieceColors.Black };
			var tokenSource = new CancellationTokenSource();
			var gs2 = GameStateStatic.FromBoard(BoardUtils.FromNotation("r3k1br/8/8/8/8/8/8/R1B1K2R"), tokenSource.Token);
			ulong expec3 = BitBoardUtils.FromRowBytes(
				Row2: 0b00011100,
				Row1: 0b00010110
					);
			ulong expec4 = BitBoardUtils.FromRowBytes(
				Row8: 0b00110100,
				Row7: 0b00011100
					);

			var moves3 = wk.GetMovesFromPosition(Square.E1, gs2);
			gs2.MoveTo = PieceColors.Black;
			GameStateStatic.UpdateGameState(gs2, tokenSource.Token);
			var moves4 = bk.GetMovesFromPosition(Square.E8, gs2);

			Assert.AreEqual(expec3, moves3, "WK E1 --> All Moves + NO Castling (occupied cell in rock line move)");
			Assert.AreEqual(expec4, moves4, "BK E8 --> All Moves + NO Castling (occupied cell in rock line move)");
		}

		[TestMethod]
		[Priority(1)]
		public void K_NoCastling4()
		{
			var tokenSource = new CancellationTokenSource();
			var gs = GameStateStatic.FromBoard(BoardUtils.FromNotation("7q/p2r4/4k3/R4p2/B1p4p/8/1n6/4K3"), tokenSource.Token);
			var wk = new King() { Color = PieceColors.White };
			var moves = wk.GetMovesFromPosition(Square.E1, gs);

		}


		[TestMethod]
		[Priority(1)]
		public void K_CastlingSubMovesWhite()
		{
			var tokenSource = new CancellationTokenSource();
			var gs1 = GameStateStatic.FromBoard(BoardUtils.FromNotation("8/8/8/8/8/8/8/R3K2R"), tokenSource.Token);

			var moves1 = (gs1.Board.GetPiece(Square.E1) as King).GetMoves(Square.E1, gs1);

			var arroccoLungo = moves1.Where(m => m.DestinationSquare == Square.C1);
			var arroccoCorto = moves1.Where(m => m.DestinationSquare == Square.G1);

			var arlCount = arroccoLungo.Count();
			var arcCount = arroccoCorto.Count();

			Assert.AreEqual(1, arlCount, $"Arrocco Lungo trovato: {arlCount} invece che 1");
			Assert.AreEqual(1, arcCount, $"Arrocco Corto trovato: {arcCount} invece che 1");

			Assert.IsTrue(arroccoLungo.First().SubSequentialMoves != null, "Arrocco Lungo senza subsequential");
			Assert.IsTrue(arroccoCorto.First().SubSequentialMoves != null, "Arrocco Corto senza subsequential");

			Assert.AreEqual(1, arroccoLungo.First().SubSequentialMoves.Count(), "Arrocco Lungo con subsequential != 1");
			Assert.AreEqual(1, arroccoCorto.First().SubSequentialMoves.Count(), "Arrocco Corto con subsequential != 1");

			Assert.IsTrue(arroccoLungo.First().SubSequentialMoves.First().DestinationSquare == Square.D1, "Arrocco Lungo - torre non in d1");
			Assert.IsTrue(arroccoCorto.First().SubSequentialMoves.First().DestinationSquare == Square.F1, "Arrocco Corto - torre non in g1");
		}

		[TestMethod]
		[Priority(1)]
		public void K_CastlingSubMovesBlack()
		{
			var tokenSource = new CancellationTokenSource();
			var gs1 = GameStateStatic.FromBoard(BoardUtils.FromNotation("r3k2r/8/8/8/8/8/8/8"), tokenSource.Token);
			gs1.MoveTo = PieceColors.Black;
			GameStateStatic.UpdateGameState(gs1, tokenSource.Token);

			var piece = (King)gs1.Board.GetPiece(Square.E8);
			var moves1 = piece.GetMoves(Square.E8, gs1);

			var arroccoLungo = moves1.Where(m => m.DestinationSquare == Square.C8);
			var arroccoCorto = moves1.Where(m => m.DestinationSquare == Square.G8);

			Assert.AreEqual(1, arroccoLungo.Count(), "Arrocco Lungo != 1");
			Assert.AreEqual(1, arroccoCorto.Count(), "Arrocco Corto != 1");

			Assert.IsTrue(arroccoLungo.First().SubSequentialMoves != null, "Arrocco Lungo senza subsequential");
			Assert.IsTrue(arroccoCorto.First().SubSequentialMoves != null, "Arrocco Corto senza subsequential");

			Assert.AreEqual(1, arroccoLungo.First().SubSequentialMoves.Count(), "Arrocco Lungo con subsequential != 1");
			Assert.AreEqual(1, arroccoCorto.First().SubSequentialMoves.Count(), "Arrocco Corto con subsequential != 1");

			Assert.IsTrue(arroccoLungo.First().SubSequentialMoves.First().DestinationSquare == Square.D8, "Arrocco Lungo - torre non in d8");
			Assert.IsTrue(arroccoCorto.First().SubSequentialMoves.First().DestinationSquare == Square.F8, "Arrocco Corto - torre non in g8");
		}
	}
}
