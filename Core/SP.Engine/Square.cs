using SP.Core;
using System;

namespace SP.Engine
{

    [Flags]
    public enum SquareBits : ulong
    {
        H1 = (ulong)1 << 0, G1 = (ulong)1 << 1, F1 = (ulong)1 << 2, E1 = (ulong)1 << 3, D1 = (ulong)1 << 4, C1 = (ulong)1 << 5, B1 = (ulong)1 << 6, A1 = (ulong)1 << 7,
        H2 = (ulong)1 << 8, G2 = (ulong)1 << 9, F2 = (ulong)1 << 10, E2 = (ulong)1 << 11, D2 = (ulong)1 << 12, C2 = (ulong)1 << 13, B2 = (ulong)1 << 14, A2 = (ulong)1 << 15,
        H3 = (ulong)1 << 16, G3 = (ulong)1 << 17, F3 = (ulong)1 << 18, E3 = (ulong)1 << 19, D3 = (ulong)1 << 20, C3 = (ulong)1 << 21, B3 = (ulong)1 << 22, A3 = (ulong)1 << 23,
        H4 = (ulong)1 << 24, G4 = (ulong)1 << 25, F4 = (ulong)1 << 26, E4 = (ulong)1 << 27, D4 = (ulong)1 << 28, C4 = (ulong)1 << 29, B4 = (ulong)1 << 30, A4 = (ulong)1 << 31,
        H5 = (ulong)1 << 32, G5 = (ulong)1 << 33, F5 = (ulong)1 << 34, E5 = (ulong)1 << 35, D5 = (ulong)1 << 36, C5 = (ulong)1 << 37, B5 = (ulong)1 << 38, A5 = (ulong)1 << 39,
        H6 = (ulong)1 << 40, G6 = (ulong)1 << 41, F6 = (ulong)1 << 42, E6 = (ulong)1 << 43, D6 = (ulong)1 << 44, C6 = (ulong)1 << 45, B6 = (ulong)1 << 46, A6 = (ulong)1 << 47,
        H7 = (ulong)1 << 48, G7 = (ulong)1 << 49, F7 = (ulong)1 << 50, E7 = (ulong)1 << 51, D7 = (ulong)1 << 52, C7 = (ulong)1 << 53, B7 = (ulong)1 << 54, A7 = (ulong)1 << 55,
        H8 = (ulong)1 << 56, G8 = (ulong)1 << 57, F8 = (ulong)1 << 58, E8 = (ulong)1 << 59, D8 = (ulong)1 << 60, C8 = (ulong)1 << 61, B8 = (ulong)1 << 62, A8 = (ulong)1 << 63,
    }

    public static partial class Extensions
    {
        public static ulong ToSquareBits(this Square sq)
        {
            return (((ulong)1)<<(short)sq);
        }
    }

}