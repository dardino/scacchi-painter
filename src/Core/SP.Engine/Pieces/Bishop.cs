using SP.Core;
using System.Collections.Generic;

namespace SP.Engine.Pieces
{

	[Figurine(PieceFigurine.Bishop)]
	[PieceName("B")]
	public class Bishop : EnginePiece
	{

		public override ulong GetCapturesFromPosition(Square s, GameState gameState)
		{
			return GetMovesFromPosition(s, gameState) & gameState.Enemies; // solo le mosse che coinvolgono i nemici
		}

		#region GetMoves
		public override ulong GetMovesFromPosition(Square s, GameState gameState)
		{
			return CommonUtils.GetDiagonalMoves(s, gameState.Allied, gameState.Enemies);
		}

		#endregion
		


	}
}
