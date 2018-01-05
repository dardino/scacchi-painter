using SP.Core;
using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;

namespace SP.Engine
{
	public abstract class EnginePiece : PieceBase
	{

		public ulong GetCapturesFromPosition(Columns col, Rows row, GameState gInfo)
		{
			return GetCapturesFromPosition(BoardSquare.GetSquareIndex(col, row), gInfo);
		}
		public ulong GetMovesFromPosition(Columns col, Rows row)
		{
			return GetMovesFromPosition(BoardSquare.GetSquareIndex(col, row), new GameState());
		}
		public ulong GetMovesFromPosition(Columns col, Rows row, GameState gInfo)
		{
			return GetMovesFromPosition(BoardSquare.GetSquareIndex(col, row), gInfo);
		}

		internal bool IsKing
		{
			get {
				return Name == "K";
			}
		}

		public IEnumerable<Move> GetMoves(Square fromSquare, GameState state)
		{
			var bbMoves = GetMovesFromPosition(fromSquare, state);			

			var squares = BitBoard.GetListOfSquares(bbMoves);
			foreach (var toSquare in squares)
			{
				yield return new Move
				{
					Piece = this,
					SourceSquare = fromSquare,
					IsCapture = IsCapture(fromSquare, toSquare, state),
					DestinationSquare = toSquare,
					SubSequentialMoves = GetSubSequentialMoves(fromSquare, toSquare, state)
				};
			}
		}

		public abstract ulong GetAttackingSquares(Square s, GameState gInfo);
		public abstract ulong GetCapturesFromPosition(Square s, GameState gInfo);
		public virtual ulong GetMovesFromPosition(Square s, GameState gInfo) {
			return (GetAttackingSquares(s, gInfo) | gInfo.Allied) ^ gInfo.Allied;
		}
		public bool IsAttackingSquare(Square fromSquare, Square squareToCheck, GameState gInfo) {
			var a = GetAttackingSquares(fromSquare, gInfo);
			return (a & (ulong)squareToCheck.ToSquareBits()) > 0;
		}
		public virtual IEnumerable<Move> GetSubSequentialMoves(Square from, Square to, GameState gInfo) {
			return null;
		}
		public bool IsCapture(Square from, Square to, GameState gInfo) {
			return (GetCapturesFromPosition(from, gInfo) & (ulong)to.ToSquareBits()) > 0;
		}

		internal static List<Type> piecetypes = typeof(EnginePiece).Assembly.GetTypes().Where(f => f.BaseType == typeof(EnginePiece)).ToList();

		public static EnginePiece FromPieceBase(PieceBase piece)
		{
			if (piece is null) return null;
			var instance = MakePieceClass(piece.Name);
			if (instance is null) return null;
			instance.Color = piece.Color;
			instance.Name = piece.Name;
			instance.Rotation = piece.Rotation;
			return instance;
		}

		private static EnginePiece MakePieceClass(string name)
		{
			var type = FindClass(name);
			if (type == null) return null;
			var instance = Activator.CreateInstance(type) as EnginePiece;
			return instance;
		}
		private static Type FindClass(string name)
		{
			var filtered = piecetypes
				.Where(p =>
				{
					var x = (
						p.GetCustomAttributes(false)
						.Where(f => f.GetType() == typeof(PieceNameAttribute))
						.FirstOrDefault() as PieceNameAttribute
					);
					return !(x is null) && x.PieceName == name;
				});

			return filtered.FirstOrDefault();
		}

		public override string ToString()
		{
			var t = GetType().GetCustomAttributes(false)
						.Where(f => f.GetType() == typeof(PieceNameAttribute))
						.FirstOrDefault() as PieceNameAttribute;
			var n = t == null ? GetType().Name : t.PieceName;
			if (Color == PieceColors.Neutral) n = "n" + n.ToUpper();
			return n;
		}
	}

}
