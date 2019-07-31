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

		public static BitBoard FromRowBytes(uint Row1 = 0, uint Row2 = 0, uint Row3 = 0, uint Row4 = 0, uint Row5 = 0, uint Row6 = 0, uint Row7 = 0, uint Row8 = 0)
		{
			return fromRowBytes(new uint[] { Row8, Row7, Row6, Row5, Row4, Row3, Row2, Row1 });
		}

		private static BitBoard fromRowBytes(uint[] row)
		{
			ulong ret = 0;
			if (row.Length > 8) throw new IndexOutOfRangeException("Too many rows!");
			for (var r = 0; r < row.Length; r++)
			{
				var ri = 7 - r;
				ret = ret | ((ulong)row[r] << (8 * ri));
			}
			return ret;
		}

		public static IEnumerable<Square> GetListOfSquares(BitBoard bitBoard) {
			for (int i = 0; i < 64; i++)
			{
				if ((bitBoard & ((Square)i).ToSquareBits()) > 0)
					yield return (Square)i;
			}
		}
	}
}
