using SP.Core;
using System;
using System.Collections.Generic;
using System.Text;

namespace SP.Engine
{


	public struct BitBoard
	{
		private UInt64 value;
		public BitBoard(UInt64 board)
		{
			this.value = board;
		}
		public static implicit operator BitBoard(UInt64 board)
		{
			return new BitBoard(board);
		}
		public static implicit operator UInt64(BitBoard board)
		{
			return board.value;
		}
		private static bool IsBitSet(BitBoard bitBoard, int posBit)
		{
			return (bitBoard & ((UInt64)1 << (posBit))) != 0;
		}
		public static BitBoard ToBitBoard(int toConvert)
		{
			return (UInt64)1 << toConvert;
		}
		public static void Display(BitBoard bitBoard)
		{
			for (int r = 7; r >= 0; r--)
			{
				Console.WriteLine("------------------------");
				for (int c = 0; c <= 7; c++)
				{
					Console.Write('[');
					if (IsBitSet(bitBoard, Board.GetSquareIndex((Columns)c, (Rows)r)))
					{
						Console.ForegroundColor = ConsoleColor.Green;
						Console.Write('1');
					}
					else
					{
						Console.ForegroundColor = ConsoleColor.DarkRed;
						Console.Write('0');
					}

					Console.ResetColor();
					Console.Write(']');
				}
				Console.WriteLine();
			}
		}
		public static int PopCount(BitBoard bitBoard)
		{
			UInt64 M1 = 0x5555555555555555;  // 1 zero,  1 one ...
			UInt64 M2 = 0x3333333333333333;  // 2 zeros,  2 ones ...
			UInt64 M4 = 0x0f0f0f0f0f0f0f0f;  // 4 zeros,  4 ones ...
			UInt64 M8 = 0x00ff00ff00ff00ff;  // 8 zeros,  8 ones ...
			UInt64 M16 = 0x0000ffff0000ffff;  // 16 zeros, 16 ones ...
			UInt64 M32 = 0x00000000ffffffff;  // 32 zeros, 32 ones

			bitBoard = (bitBoard & M1) + ((bitBoard >> 1) & M1);   //put count of each  2 bits into those  2 bits
			bitBoard = (bitBoard & M2) + ((bitBoard >> 2) & M2);   //put count of each  4 bits into those  4 bits
			bitBoard = (bitBoard & M4) + ((bitBoard >> 4) & M4);   //put count of each  8 bits into those  8 bits
			bitBoard = (bitBoard & M8) + ((bitBoard >> 8) & M8);   //put count of each 16 bits into those 16 bits
			bitBoard = (bitBoard & M16) + ((bitBoard >> 16) & M16);   //put count of each 32 bits into those 32 bits
			bitBoard = (bitBoard & M32) + ((bitBoard >> 32) & M32);   //put count of each 64 bits into those 64 bits
			return (int)bitBoard.value;
		}
		public static int BitScanForward(BitBoard bitBoard)
		{
			return Constants.DeBrujinTable[((ulong)((long)bitBoard.value & -(long)bitBoard.value) * Constants.DeBrujinValue) >> 58];
		}
		public static int BitScanForwardReset(ref BitBoard bitBoard)
		{
			int bitIndex = Constants.DeBrujinTable[((ulong)((long)bitBoard.value & -(long)bitBoard.value) * Constants.DeBrujinValue) >> 58];
			bitBoard &= bitBoard - 1;
			return bitIndex;
		}
	}
}
