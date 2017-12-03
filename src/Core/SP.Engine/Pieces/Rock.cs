using System;
using System.Collections.Generic;
using System.Text;
using SP.Core;

namespace SP.Engine.Pieces
{
	[Figurine(PieceFigurine.Rock)]
	public class Rock : EnginePiece
	{

		public override ulong GetCapturesFromPosition(Square s, GameState g)
		{
			return GetMovesFromPosition(s, g) & g.enemies; // solo le mosse che coinvolgono i nemici
		}

		public override ulong GetMovesFromPosition(Square s, GameState g)
		{
			return CommonUtils.GetOrthogonalMoves(s, g.allied, g.enemies);
		}

		public override bool IsAttackingSquare(Square fromSquare, Square squareToCheck, GameState g)
		{
			return (GetMovesFromPosition(fromSquare, new GameState { enemies = g.allied | g.enemies | (ulong)squareToCheck.ToSquareBits() }) & (ulong)squareToCheck.ToSquareBits()) > 0;
		}
	}
}
