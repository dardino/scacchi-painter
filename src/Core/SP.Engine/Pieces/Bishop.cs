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

		public override bool IsAttackingSquare(Square fromSquare, Square squareToCheck, GameState gameState)
		{
			var gs = GameState.FromOnlyEnemies(gameState.All | (ulong)squareToCheck.ToSquareBits(), gameState.MoveTo);
			return (GetCapturesFromPosition(fromSquare, gs)
				& (ulong)squareToCheck.ToSquareBits()) > 0;
		}

		public override IEnumerable<Move> GetMoves(ulong bitb)
		{
			return new List<Move>();
		}
	}
}
