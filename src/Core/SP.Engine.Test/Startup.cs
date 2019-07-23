using SP.Engine.Pieces;
using System;
using System.Collections.Generic;
using System.Text;

namespace SP.Core.Engine.Test
{
	class Startup
	{
		static void Main(string[] args)
		{
			var test0 = new KingMovesTests();
			test0.K_MoveInOccupiedBoard();

			var test1 = new PawnMovesTests();
			test1.P_MoveInOccupiedBoard();

			var test2 = new BishopMovesTests();
			test2.B_MoveInOccupiedBoard();

			var test3 = new RockMovesTests();
			test3.R_MoveInOccupiedBoard();
		}
	}
}
