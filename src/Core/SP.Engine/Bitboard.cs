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

		public static string[] GetRepresentation(BitBoard bitBoard)
		{
			List<string> outtext = new List<string>();
			outtext.Add(Convert.ToString((long)(ulong)bitBoard, 2).PadLeft(64, '0'));
			outtext.Add("---------------------------");
			for (int r = 0; r < 8; r++)
			{
				var row = "";
				for (int c = 0; c < 8; c++)
				{
					row += $@"{(IsBitSet(bitBoard, (int)BoardSquare.GetSquareIndex((Columns)c, (Rows)r)) ? "1" : "0")}   ";
				}
				outtext.Add("|   " + row + "|");
			}
			outtext.Add("---------------------------");
			return outtext.ToArray();

		}

	}
}
