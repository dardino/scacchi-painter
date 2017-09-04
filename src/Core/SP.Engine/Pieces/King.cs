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

		public override ulong GetCapturesFromPosition(Square s, ulong allied, ulong enemies)
		{
			ulong moves = GetMovesFromPosition(s, allied, enemies);
			return (moves & enemies);
		}

		public override ulong GetMovesFromPosition(Square fromSq, ulong allied, ulong enemies)
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
			return (allied & m2clone) ^ m2clone;
		}

		public override bool IsAttackingSquare(Square fromSquare, Square attackingSquare, ulong allied, ulong enemies)
		{
			var moves = GetMovesFromPosition(fromSquare, allied, enemies);
			return ((ulong)Math.Pow(2, (int)attackingSquare) & moves) > 0;
		}
	}
}
