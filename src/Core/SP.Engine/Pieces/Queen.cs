using System;
using System.Collections.Generic;
using System.Text;
using SP.Core;

namespace SP.Engine.Pieces
{
	[Figurine(PieceFigurine.Queen)]
	[PieceName("Q")]
	public class Queen : EnginePiece
	{
		public override ulong GetCapturesFromPosition(Square s, GameState g)
		{
			return GetMovesFromPosition(s, g) & g.Enemies; // solo le mosse che coinvolgono i nemici
		}

		public override ulong GetMovesFromPosition(Square s, GameState g)
		{
			return CommonUtils.GetOrthogonalMoves(s, g.Allied, g.Enemies) | 
				CommonUtils.GetDiagonalMoves(s, g.Allied, g.Enemies);
		}

		public override bool IsAttackingSquare(Square fromSquare, Square squareToCheck, GameState g)
		{
			var gs = GameState.FromOnlyEnemies(g.All | (ulong)squareToCheck.ToSquareBits(), g.MoveTo);
			return (GetMovesFromPosition(fromSquare, gs) & (ulong)squareToCheck.ToSquareBits()) > 0;
		}

		public override IEnumerable<Move> GetMoves(ulong bitb)
		{
			return new List<Move>();
		}

	}
}
