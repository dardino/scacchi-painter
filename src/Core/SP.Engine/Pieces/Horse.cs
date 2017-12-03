using SP.Core;
using System;
using System.Collections.Generic;
using System.Text;

namespace SP.Engine.Pieces
{
	[Figurine(PieceFigurine.Horse)]
	public class Horse : EnginePiece
	{
		static ulong c3Moves = (ulong)(SquareBits.A2 | SquareBits.A4 | SquareBits.B1 | SquareBits.B5 | SquareBits.D5 | SquareBits.D1 | SquareBits.E2 | SquareBits.E4);

		public override ulong GetCapturesFromPosition(Square s, GameState gameState)
		{
			return GetMovesFromPosition(s, gameState) & gameState.enemies;
		}

		public static ulong[] Cols = new ulong[] {
			                                          0x0101010101010101 | 0x0202020202020202 | 0x0404040404040404,
			                     0x0101010101010101 | 0x0202020202020202 | 0x0404040404040404 | 0x0808080808080808,
			0x0101010101010101 | 0x0202020202020202 | 0x0404040404040404 | 0x0808080808080808 | 0x1010101010101010,
			0x0202020202020202 | 0x0404040404040404 | 0x0808080808080808 | 0x1010101010101010 | 0x2020202020202020,
			0x0404040404040404 | 0x0808080808080808 | 0x1010101010101010 | 0x2020202020202020 | 0x4040404040404040,
			0x0808080808080808 | 0x1010101010101010 | 0x2020202020202020 | 0x4040404040404040 | 0x8080808080808080,
			0x1010101010101010 | 0x2020202020202020 | 0x4040404040404040 | 0x8080808080808080,
			0x2020202020202020 | 0x4040404040404040 | 0x8080808080808080
		};

		public override ulong GetMovesFromPosition(Square s, GameState g)
		{
			var fullC = Cols[(int)s.GetColumn()];
			var dc3 = s - Square.C3;
			var allMoves = (dc3 < 0 ? c3Moves >> (0 - dc3) : c3Moves << dc3) & fullC;
			return (allMoves | g.allied) ^ g.allied; // dove sono gli enemies non mi serve saperlo.
		}

		public override bool IsAttackingSquare(Square fromSquare, Square squareToCheck, GameState g)
		{
			return (GetMovesFromPosition(fromSquare, new GameState { enemies = g.allied | g.enemies | (ulong)squareToCheck.ToSquareBits() }) & (ulong)squareToCheck.ToSquareBits()) > 0;
		}
	}
}
