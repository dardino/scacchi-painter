﻿using System;
using System.Collections.Generic;
using System.Text;
using SP.Core;

namespace SP.Engine.Pieces
{
	[Figurine(PieceFigurine.Rock)]
	public class Rock : EnginePiece
	{

		public override ulong GetCapturesFromPosition(Square s, ulong allied, ulong enemies)
		{
			return GetMovesFromPosition(s, allied, enemies) & enemies; // solo le mosse che coinvolgono i nemici
		}

		public override ulong GetMovesFromPosition(Square s, ulong allied, ulong enemies)
		{
			return CommonUtils.GetOrthogonalMoves(s, allied, enemies);
		}

		public override bool IsAttackingSquare(Square fromSquare, Square squareToCheck, ulong allied, ulong enemies)
		{
			return (GetMovesFromPosition(fromSquare, allied, enemies) & (ulong)squareToCheck.ToSquareBits()) > 0;
		}
	}
}