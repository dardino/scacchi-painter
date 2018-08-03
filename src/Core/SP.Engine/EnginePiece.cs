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

		internal bool IsKing => Name == "K";
		internal bool IsPawn => Name == "P";

		public IEnumerable<HalfMove> GetMoves(Square fromSquare, GameState state)
		{

			var bbMoves = GetMovesFromPosition(fromSquare, state);			

			var squares = BitBoard.GetListOfSquares(bbMoves);
			foreach (var toSquare in squares)
			{
				if (IsPawn && (toSquare.GetRow() == Rows.Row8 || toSquare.GetRow() == Rows.Row1))
				{
					foreach (var p in state.AvailablePromotionsTypes)
					{
						yield return new HalfMove
						{
							Piece = this,
							SourceSquare = fromSquare,
							IsCapture = IsCapture(fromSquare, toSquare, state),
							DestinationSquare = toSquare,
							SubSequentialMoves = new List<HalfMove> {
								new HalfMove()
								{
									Piece = MakePieceClass(p, Color),
									DestinationSquare = toSquare,
									SourceSquare = toSquare,
									SubSequentialMoves = null,
									IsCapture = false
								}
							}
						};
					}
				}
				else
				{
					yield return new HalfMove
					{
						Piece = this,
						SourceSquare = fromSquare,
						IsCapture = IsCapture(fromSquare, toSquare, state),
						DestinationSquare = toSquare,
						SubSequentialMoves = GetSubSequentialMoves(fromSquare, toSquare, state)
					};
				}

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
		public virtual IEnumerable<HalfMove> GetSubSequentialMoves(Square from, Square to, GameState gInfo) {
			return null;
		}
		public bool IsCapture(Square from, Square to, GameState gInfo) {
			return (GetCapturesFromPosition(from, gInfo) & (ulong)to.ToSquareBits()) > 0;
		}

		internal static List<Type> piecetypes = typeof(EnginePiece).Assembly.GetTypes().Where(f => f.BaseType == typeof(EnginePiece)).ToList();

		public static EnginePiece FromPieceBase(PieceBase piece)
		{
			if (piece is null) return null;
			var instance = MakePieceClass(piece.Name, piece.Color);
			if (instance is null) return null;
			instance.Name = piece.Name;
			instance.Rotation = piece.Rotation;
			return instance;
		}
		
		private static EnginePiece MakePieceClass(Type type, PieceColors color)
		{
			var instance = Activator.CreateInstance(type) as EnginePiece;
			instance.Color = color;
			return instance;
		}

		private static EnginePiece MakePieceClass(string name, PieceColors color)
		{
			var type = FindClass(name);
			if (type == null) return null;
			return MakePieceClass(type, color);
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
