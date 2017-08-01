using SP.Core;
using System;
using System.Collections.Generic;
using System.Text;

namespace SP.Engine.Pieces
{

	[Figurine(PieceFigurine.Bishop)]
	public class Bishop : EnginePiece
	{

		public override ulong GetCapturesFromPosition(Columns col, Rows row, ulong allied, ulong enemies)
		{
			return GetMovesFromPosition(col, row);
		}

		public override ulong GetCapturesFromPosition(Square s, ulong allied, ulong enemies)
		{
			throw new NotImplementedException();
		}

		#region GetMoves
		public override ulong GetMovesFromPosition(Columns col, Rows row)
		{
			return GetMovesFromPosition(col, row, 0, 0);
		}
		public override ulong GetMovesFromPosition(Columns col, Rows row, ulong allied, ulong enemies)
		{
			return GetMovesFromPosition(BoardSquare.GetSquareIndex(col, row), 0, 0);
		}
		public override ulong GetMovesFromPosition(Square s, ulong allied, ulong enemies)
		{
			var mydiagA = CommonUtils.GetBotLeft2TopRightDiagonal(s);
			var mydiagB = CommonUtils.GetTopLeft2BottomRight(s);
			// var oppsA = enemies & mydiagA; 
			// var oppsB = enemies & mydiagB; 
			return (mydiagA | mydiagB);
		}
		#endregion

		public override bool IsAttackingSquare(Square fromSquare, Square squareToCheck, ulong allied, ulong enemies)
		{
			throw new NotImplementedException();
		}
	}
}
