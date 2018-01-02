using System.Collections.Generic;

namespace SP.Core
{
	internal enum StipulationTypeEnum {
		Direct,
		Help,
		Self,
		HelpSelf
	}

	internal static class StipulationTypeEnumEx {
		private static Dictionary<StipulationTypeEnum, PieceColors> steColors = new Dictionary<StipulationTypeEnum, PieceColors> {
			{ StipulationTypeEnum.Direct  , PieceColors.White },
			{ StipulationTypeEnum.Help    , PieceColors.Black },
			{ StipulationTypeEnum.Self    , PieceColors.White },
			{ StipulationTypeEnum.HelpSelf, PieceColors.Black }
		};
		private static Dictionary<StipulationTypeEnum, string> steStrings = new Dictionary<StipulationTypeEnum, string> {
			{ StipulationTypeEnum.Direct  , "" },
			{ StipulationTypeEnum.Help    , "H" },
			{ StipulationTypeEnum.Self    , "S" },
			{ StipulationTypeEnum.HelpSelf, "HS" }
		};

		public static PieceColors GetColorToMove(this StipulationTypeEnum ste) {
			return steColors[ste];
		}
		public static string ToStandardString(this StipulationTypeEnum ste)
		{
			return steStrings[ste];
		}
	}
}