using SP.Core;
using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;

namespace SP.Engine
{
	public abstract class EnginePiece : PieceBase
	{
		public ulong GetCapturesFromPosition(Columns col, Rows row, ulong allied, ulong enemies)
		{
			return GetCapturesFromPosition(BoardSquare.GetSquareIndex(col, row), allied, enemies);
		}
		public ulong GetMovesFromPosition(Columns col, Rows row)
		{
			return GetMovesFromPosition(BoardSquare.GetSquareIndex(col, row), 0, 0);
		}
		public ulong GetMovesFromPosition(Columns col, Rows row, ulong allied, ulong enemies)
		{
			return GetMovesFromPosition(BoardSquare.GetSquareIndex(col, row), allied, enemies);
		}

		public abstract ulong GetMovesFromPosition(Square s, ulong allied, ulong enemies);
		public abstract ulong GetCapturesFromPosition(Square s, ulong allied, ulong enemies);
		public abstract bool IsAttackingSquare(Square fromSquare, Square squareToCheck, ulong allied, ulong enemies);
	}
}
