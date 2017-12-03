using SP.Core;
using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;

namespace SP.Engine
{
	public abstract class EnginePiece : PieceBase
	{
		public ulong GetCapturesFromPosition(Columns col, Rows row, GameState gInfo)
		{
			return GetCapturesFromPosition(BoardSquare.GetSquareIndex(col, row), gInfo);
		}
		public ulong GetMovesFromPosition(Columns col, Rows row)
		{
			return GetMovesFromPosition(BoardSquare.GetSquareIndex(col, row), new GameState());
		}
		public ulong GetMovesFromPosition(Columns col, Rows row, GameState gInfo)
		{
			return GetMovesFromPosition(BoardSquare.GetSquareIndex(col, row),  gInfo);
		}

		public abstract ulong GetMovesFromPosition   (Square s, GameState gInfo);
		public abstract ulong GetCapturesFromPosition(Square s, GameState gInfo);
		public abstract bool IsAttackingSquare(Square fromSquare, Square squareToCheck, GameState gInfo);
	}
}
