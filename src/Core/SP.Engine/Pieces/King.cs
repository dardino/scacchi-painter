using SP.Core;
using System;
using System.Collections.Generic;
using System.Text;

namespace SP.Engine.Pieces
{
	[Figurine(PieceFigurine.King)]
	public class King : EnginePiece
	{
		static ulong movesFromB2 = 0xE0A0E0;
		static int b2Index = (int)BoardSquare.GetSquareIndex(Columns.ColB, Rows.Row2);

		public override ulong GetCapturesFromPosition(Square s, GameState gameState)
		{
			ulong moves = GetMovesFromPosition(s, gameState);
			return (moves & gameState.enemies);
		}

		public override ulong GetMovesFromPosition(Square fromSq, GameState gameState)
		{
			int c = (int)fromSq - b2Index;
			var m2clone = movesFromB2;
			if (c != 0)
			{
				var col = ((BoardSquare)fromSq).Column;
				if (c < 0) m2clone = m2clone >> (c * -1);
				if (c > 0) m2clone = m2clone << c;
				if (col == Columns.ColA) m2clone &= 0xFEFEFEFEFEFEFEFE;
				if (col == Columns.ColH) m2clone &= 0x7F7F7F7F7F7F7F7F;
			}
			return (gameState.allied & m2clone) ^ m2clone;
		}

		public override bool IsAttackingSquare(Square fromSquare, Square attackingSquare, GameState gameState)
		{
			var moves = GetMovesFromPosition(fromSquare, gameState);
			return ((ulong)Math.Pow(2, (int)attackingSquare) & moves) > 0;
		}
	}
}
