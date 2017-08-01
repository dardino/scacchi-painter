using SP.Core;
using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;

namespace SP.Engine
{
	public abstract class EnginePiece : PieceBase
	{
		public abstract ulong GetMovesFromPosition(Columns col, Rows row, ulong allied, ulong enemies);
		public abstract ulong GetMovesFromPosition(Square s, ulong allied, ulong enemies);
		public abstract ulong GetMovesFromPosition(Columns col, Rows row);
		public abstract ulong GetCapturesFromPosition(Columns col, Rows row, ulong allied, ulong enemies);
		public abstract ulong GetCapturesFromPosition(Square s, ulong allied, ulong enemies);
		public abstract bool IsAttackingSquare(Square fromSquare, Square squareToCheck, ulong allied, ulong enemies);
	}
}
