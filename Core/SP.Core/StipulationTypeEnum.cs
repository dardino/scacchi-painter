using System.Collections.Generic;

namespace SP.Core
{
    public enum StipulationTypeEnum
    {
        Other = 0,
        Direct = 1,
        Help = 2,
        Self = 3,
        ProofGame = 4,
        ShortProofGame = 5,
        Study = 6,
        RetroAnalisys = 7,
        Reflex = 8,
        HelpSelf = 9
    }

    internal static class StipulationTypeEnumEx
    {
        private static readonly Dictionary<StipulationTypeEnum, PieceColors> steColors = new Dictionary<StipulationTypeEnum, PieceColors> {
            { StipulationTypeEnum.Direct  , PieceColors.White },
            { StipulationTypeEnum.Help    , PieceColors.Black },
            { StipulationTypeEnum.Self    , PieceColors.White },
            { StipulationTypeEnum.HelpSelf, PieceColors.Black }
        };
        private static readonly Dictionary<StipulationTypeEnum, string> steStrings = new Dictionary<StipulationTypeEnum, string> {
            { StipulationTypeEnum.Direct  , "" },
            { StipulationTypeEnum.Help    , "H" },
            { StipulationTypeEnum.Self    , "S" },
            { StipulationTypeEnum.HelpSelf, "HS" }
        };

        public static PieceColors GetColorToMove(this StipulationTypeEnum ste)
        {
            return steColors[ste];
        }
        public static string ToStandardString(this StipulationTypeEnum ste)
        {
            return steStrings[ste];
        }
    }
}
