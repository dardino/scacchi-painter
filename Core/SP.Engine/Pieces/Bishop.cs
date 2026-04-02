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

		public override ulong GetAttackingSquares(Square s, GameState gInfo)
		{
			return CommonUtils.GetDiagonalMoves(s, gInfo.Allied, gInfo.Enemies);
		}

	}
}
