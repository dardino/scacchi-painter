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

		public abstract ulong GetMovesFromPosition(Square s, GameState gInfo);
		public abstract ulong GetCapturesFromPosition(Square s, GameState gInfo);
		public abstract bool IsAttackingSquare(Square fromSquare, Square squareToCheck, GameState gInfo);
		public abstract IEnumerable<Move> GetMoves(ulong bitb);

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


	}

}
