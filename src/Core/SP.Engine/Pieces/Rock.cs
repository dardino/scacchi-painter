using System;
using System.Collections.Generic;
using System.Text;
using SP.Core;

namespace SP.Engine.Pieces
{
	[Figurine(PieceFigurine.Rock)]
	[PieceName("R")]
	public class Rock : EnginePiece
	{
		public override ulong GetCapturesFromPosition(Square s, GameState g)
		{
			return GetMovesFromPosition(s, g) & g.Enemies; // solo le mosse che coinvolgono i nemici
		}
		public override ulong GetAttackingSquares(Square s, GameState g)
		{
			return CommonUtils.GetOrthogonalMoves(s, g.Allied, g.Enemies);
		}
		
	}
}
