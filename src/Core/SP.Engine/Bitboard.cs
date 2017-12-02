using SP.Core;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Text;

namespace SP.Engine
{


	public struct BitBoard
	{
		private ulong value;
		public BitBoard(ulong board)
		{
			value = board;
		}
		public static implicit operator BitBoard(ulong board)
		{
			return new BitBoard(board);
		}
		public static implicit operator ulong(BitBoard board)
		{
			return board.value;
		}
		private static bool IsBitSet(BitBoard bitBoard, int posBit)
		{
			return (bitBoard & (1ul << posBit)) != 0;
		}
		public static BitBoard ToBitBoard(int toConvert)
		{
			return 1ul << toConvert;
		}

		public static string[] GetRepresentation(params BitBoard[] bitBoard)
		{
			var bb2p = bitBoard.Length;

			List<string> outtext = new List<string>();
			var top = "";
			for (var bb = 0; bb < bb2p; bb++)
			{
				top += "╔═══╤═══╤═══╤═══╤═══╤═══╤═══╤═══╗";
			}
			outtext.Add(top);
			for (int r = 7; r > -1; r--)
			{
				var globalRow = "";
				for (var bb = 0; bb < bb2p; bb++)
				{
					var row = "";
					for (int c = 7; c > -1; c--)
					{
						row += $@"{(IsBitSet(bitBoard[bb], (int)BoardSquare.GetSquareIndex((Columns)c, (Rows)r)) ? "▐█▌" : "   ")}";
						if (c > 0) row += "│";
					}
					globalRow += "║" + row + "║";
				}
				outtext.Add(globalRow);
			}
			var bot = "";
			for (var bb = 0; bb < bb2p; bb++)
			{
				bot += "╚═══╧═══╧═══╧═══╧═══╧═══╧═══╧═══╝";
			}
			outtext.Add(bot);
			for (var bb = 0; bb < bb2p; bb++)
			{
				outtext.Add(bb + ":");
				outtext.Add(Convert.ToString((long)(ulong)bitBoard[bb], 2).PadLeft(64, '0'));
				outtext.Add(Convert.ToString((long)(ulong)bitBoard[bb], 16).PadLeft(16, '0'));
			}

#if DEBUG
			System.Diagnostics.Debug.WriteLine(String.Join("\r\n", outtext));
			return new string[0];
#else
			return outtext.ToArray();
#endif

		}

	}
}
