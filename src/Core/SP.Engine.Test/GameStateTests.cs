using Microsoft.VisualStudio.TestTools.UnitTesting;
using SP.Core;
using SP.Core.Utils;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;

namespace SP.Engine.Test
{
	[TestClass]
	[TestCategory("Engine.GameState")]
	public class GameStateTests
	{
		[TestMethod]
		public void GameStateGenerator()
		{
			// ---------------------------------
			// |   |   |   | Q | N |   |   |   |
			// ---------------------------------
			// |   |   | p |   | r | r |   |   |
			// ---------------------------------
			// | b |   |   | n | k | p |   |   |
			// ---------------------------------
			// |   | p |   |   |   | n |   |   |
			// ---------------------------------
			// |   |   |   | P |   |   |   |   |
			// ---------------------------------
			// |   | p |   |   | p |   | b |   |
			// ---------------------------------
			// | p | P |   |   | p |   | q |   |
			// ---------------------------------
			// |   |   | K |   |   |   |   |   |
			// ---------------------------------
			var notation = "3QN3/2p1rr2/b2nkp2/1p3n2/3P4/1p2p1b1/pP2p1q1/2K5";
			ulong bitAllPieces = 0x182c9c44104aca20;
			ulong bitBlacks = 0x2c9c44004a8a00;
			ulong bitWhites = 0x1800000010004020;
			var tokenSource = new CancellationTokenSource();

			var board = BoardUtils.FromNotation(notation);
			var bitBoards = GameStateStatic.FromBoard(board, tokenSource.Token);

			Assert.AreEqual(bitAllPieces, (ulong)bitBoards.All);
			Assert.AreEqual(bitBlacks, (ulong)bitBoards.BitBoardByColor[PieceColors.Black]);
			Assert.AreEqual(bitWhites, (ulong)bitBoards.BitBoardByColor[PieceColors.White]);

		}

		[TestMethod]
		public void GameStateGetListOfMoves()
		{
			var tokenSource = new CancellationTokenSource();
			var gameState = GameStateStatic.FromBoard(BoardUtils.FromNotation("3QN3/2p1rr2/b2nkp2/1p3n2/3P4/1p2p1b1/pP2p1q1/2K5"), tokenSource.Token);
			GameStateStatic.Analyze(ref gameState);
			var moves = gameState.Moves;
			var expstr = "Pd4-d5;  Ne8*f6;  Ne8*d6;  Ne8-g7;  Ne8*c7;  Qd8*d6;  Qd8*e7;  Qd8-d7;  Qd8*c7;  Qd8-c8;  Qd8-b8;  Qd8-a8";
			var actString = System.String.Join(";  ", moves);

			Assert.AreEqual(12, moves.Count(), "List of Moves must be 12");
			Assert.AreEqual(expstr, actString, "Lrist of Moves must be " + expstr);
		}

		[TestMethod]
		public void GameStateNoMovesBecausePinned()
		{
			var tokenSource = new CancellationTokenSource();
			var gameState = GameStateStatic.FromBoard(BoardUtils.FromNotation("7b/b7/4p3/2R1P3/1qNKB2r/3QP3/8/3r4"), tokenSource.Token);
			GameStateStatic.Analyze(ref gameState);
			var moves = gameState.Moves;

			Assert.AreEqual(2, moves.Count(), "only 2 moves allowed but: " + String.Join("; ", moves));
			Assert.AreEqual("Qd3*d1; Qd3-d2", String.Join("; ", moves));
		}

		[TestMethod]
		public void GameStateClone()
		{
			var tokenSource = new CancellationTokenSource();
			var gs1 = GameStateStatic.FromBoard(BoardUtils.FromNotation("7b/b7/4p3/2R1P3/1qNKB2r/3QP3/8/3r4"), tokenSource.Token);
			var gs2 = new GameState();
			GameStateStatic.CloneTo(gs1, gs2);

			Assert.AreEqual(String.Join("   ", BoardUtils.GetRepresentation(gs2.Board)), String.Join("   ", BoardUtils.GetRepresentation(gs1.Board)));

			Assert.AreEqual(gs1.BitBoardByColor[PieceColors.Black  ], gs2.BitBoardByColor[PieceColors.Black  ]);
			Assert.AreEqual(gs1.BitBoardByColor[PieceColors.White  ], gs2.BitBoardByColor[PieceColors.White  ]);
			Assert.AreEqual(gs1.BitBoardByColor[PieceColors.Neutral], gs2.BitBoardByColor[PieceColors.Neutral]);

			var ignore = new List<string> { $"{nameof(GameState.Moves)}" };
			var ok = gs2.GetType().GetProperties()
				.Where(f => !ignore.Contains(f.Name))
				.All(f =>
			{
				var x = true;
				var name = f.Name;
				var v1 = f.GetValue(gs1);
				var v2 = f.GetValue(gs2);
				x = Equals(v1, v2);
				if (!x) {
					if (v1 is Board)
					{
						x = Equals(v1?.ToString(), v2?.ToString());
					}
					if (f.PropertyType.IsArray)
					{
						Array a1 = v1 as Array;
						Array a2 = v2 as Array;
						for (int i = 0; i < a1.Length; i++)
						{
							x = Equals(a1.GetValue(i), a2.GetValue(i));
						}
					}
					if (v1 is IEnumerable<object>)
					{
						IEnumerable<object> a1 = v1 as IEnumerable<object>;
						IEnumerable<object> a2 = v2 as IEnumerable<object>;
						for (int i = 0; i < a1.Count(); i++)
						{
							x = Equals(a1.ElementAt(i), a2.ElementAt(i));
						}
					}
				}
				Assert.IsTrue(x, $"{f.Name} not match");
				return x;
			});

		}

		[TestMethod]
		public void GameStateApplyMoveKing() {
			var board1 = BoardUtils.FromNotation("8/8/8/8/8/8/8/R3K3");
			var board2 = BoardUtils.FromNotation("8/8/8/8/8/8/8/R3K3");

			var tokenSource = new CancellationTokenSource();
			var gs1 = GameStateStatic.FromBoard(board1, tokenSource.Token);
			var gs2 = GameStateStatic.FromBoard(board2, tokenSource.Token);

			GameStateStatic.ApplyMove(gs1, new HalfMove()
			{
				DestinationSquare = Square.D1,
				SourceSquare = Square.E1,
				IsCapture = false,
				Piece = board1.GetPiece(Square.E1) as EnginePiece
			}, tokenSource.Token);

			GameStateStatic.ApplyMove(gs2, new HalfMove()
			{
				DestinationSquare = Square.C1,
				SourceSquare = Square.E1,
				IsCapture = false,
				Piece = board2.GetPiece(Square.E1) as EnginePiece,
				SubSequentialMoves = new HalfMove[] {
					new HalfMove() {
						DestinationSquare = Square.D1,
						SourceSquare = Square.A1,
						IsCapture = false,
						Piece = board2.GetPiece(Square.A1) as EnginePiece
					}
				}
			}, tokenSource.Token);

			var expected1 = BitBoardUtils.FromRowBytes(Row1: 0b10010000);
			var expected2 = BitBoardUtils.FromRowBytes(Row1: 0b00110000);

			Assert.AreEqual((ulong)gs1.All, (ulong)expected1, "mossa singola");
			Assert.AreEqual((ulong)gs2.All, (ulong)expected2, "mossa con subsequence");

		}


		[TestMethod]
		public void GameStateApplyMovePawn()
		{
			var board1 = BoardUtils.FromNotation("8/2P5/8/8/8/8/8/8");

			var tokenSource = new CancellationTokenSource();
			var gs1 = GameStateStatic.FromBoard(board1, tokenSource.Token);
			GameStateStatic.Analyze(ref gs1);
			var moves1 = gs1.Moves;
			foreach (var move in moves1)
			{
				var gc = new GameState();
				GameStateStatic.CloneTo(gs1, gc);
				GameStateStatic.ApplyMove(gc, move, tokenSource.Token);
				Assert.IsTrue(gc.Pieces.Count() == 1);
				Assert.IsTrue(gc.Pieces.First().ToString() == move.SubSequentialMoves.First().Piece.ToString());
			}

		}



		[TestMethod]
		public void GameStateActualDepth()
		{
			var board1 = BoardUtils.FromNotation("8/2P5/8/8/8/8/8/8");
			var tokenSource = new CancellationTokenSource();
			var gs1 = GameStateStatic.FromBoard(board1, tokenSource.Token);
			GameStateStatic.Analyze(ref gs1);
			var moves1 = gs1.Moves;
			Assert.AreEqual(gs1.ActualDepth, 0, "Profondità 0");
			foreach (var move in moves1)
			{
				var gc = new GameState();
				GameStateStatic.CloneTo(gs1, gc);
				GameStateStatic.ApplyMove(gc, move, tokenSource.Token);
				Assert.AreEqual(gc.ActualDepth, 0.5m, "Profondità 0.5");
			}

		}

	}
}
