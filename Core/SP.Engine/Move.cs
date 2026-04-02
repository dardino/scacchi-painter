using SP.Core;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace SP.Engine
{
    public partial class Extensions
    {
        public static string ToText(this HalfMove hm)
        {
            var sep = hm.IsCapture ? "*" : "-";

            var extra = hm.SubSequentialMoves != null && hm.SubSequentialMoves.Any()
                ? $"[{String.Join(";", hm.SubSequentialMoves.ToList())}]"
                : "";

            StringBuilder sb = new StringBuilder();
            sb.Append(hm.Piece);
            sb.Append($"{hm.SourceSquare}{sep}{hm.DestinationSquare}".ToLower());
            sb.Append(extra);
            return sb.ToString();
        }
    }

    public class HalfMove
    {
        public decimal Dept;
        public EnginePiece Piece;
        public Square SourceSquare;
        public Square DestinationSquare;
        public bool IsCapture;
        public HalfMove[] SubSequentialMoves;
        public override string ToString()
        {
            return this.ToText();
        }
        public HalfMove Clone()
        {
            var hm = new HalfMove()
            {
                Dept = Dept,
                Piece = Piece,
                DestinationSquare = DestinationSquare,
                IsCapture = IsCapture,
                SourceSquare = SourceSquare
            };
            if (SubSequentialMoves != null && SubSequentialMoves.Length > 0)
            {
                hm.SubSequentialMoves = new HalfMove[SubSequentialMoves.Length];
                Array.Copy(SubSequentialMoves, hm.SubSequentialMoves, SubSequentialMoves.Length);
            }
			return hm;
        }

    }
}