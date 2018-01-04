using Microsoft.VisualStudio.TestTools.UnitTesting;
using SP.Core;
using System;
using System.Collections.Generic;
using System.Linq;

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

			var board = Board.FromNotation(notation);
			var bitBoards = GameState.FromBoard(board);

			Assert.AreEqual(bitAllPieces, (ulong)bitBoards.All);
			Assert.AreEqual(bitBlacks, (ulong)bitBoards.BitBoardByColor[PieceColors.Black]);
			Assert.AreEqual(bitWhites, (ulong)bitBoards.BitBoardByColor[PieceColors.White]);

		}

		[TestMethod]
		public void GameStateGetListOfMoves()
		{
			var gameState = GameState.FromBoard(Board.FromNotation("3QN3/2p1rr2/b2nkp2/1p3n2/3P4/1p2p1b1/pP2p1q1/2K5"));
			var moves = gameState.GetMoves();
			var expstr = "Pd4-d5;  Ne8*f6;  Ne8*d6;  Ne8-g7;  Ne8*c7;  Qd8*d6;  Qd8*e7;  Qd8-d7;  Qd8*c7;  Qd8-c8;  Qd8-b8;  Qd8-a8";
			var actString = System.String.Join(";  ", moves);

			Assert.AreEqual(12, moves.Count(), "List of Moves must be 12");
			Assert.AreEqual(expstr, actString, "Lrist of Moves must be " + expstr);
		}

		[TestMethod]
		public void GameStateNoMovesBecausePinned()
		{
			var gameState = GameState.FromBoard(Board.FromNotation("7b/b7/4p3/2R1P3/1qNKB2r/3QP3/8/3r4"));
			var moves = gameState.GetMoves();

			Assert.AreEqual(0, moves.Count(), "no Moves allowed");
		}

		[TestMethod]
		public void GameStateClone()
		{
			var gs1 = GameState.FromBoard(Board.FromNotation("7b/b7/4p3/2R1P3/1qNKB2r/3QP3/8/3r4"));
			var gs2 = new GameState();
			gs2.CloneFrom(gs1);

			var ok = gs2.GetType().GetProperties().All(f =>
			{
				var x = true;
				var name = f.Name;
				var v1 = f.GetValue(gs1);
				var v2 = f.GetValue(gs2);
				x = Equals(v1, v2);
				if (!x) {
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
	}
}
