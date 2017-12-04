using System;
using System.Collections.Generic;
using System.Text;
using SP.Core;

namespace SP.Engine.Pieces
{
	[Figurine(PieceFigurine.Queen)]
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
			return (GetMovesFromPosition(fromSquare, new GameState { Enemies = g.Allied | g.Enemies | (ulong)squareToCheck.ToSquareBits() }) & (ulong)squareToCheck.ToSquareBits()) > 0;
		}


	}
}
