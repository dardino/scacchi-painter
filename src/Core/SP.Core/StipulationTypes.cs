namespace SP.Core
{
	public static class StipulationTypes
	{
		public static readonly StipulationType DirectMate        = new StipulationType(StipulationTypeEnum.Direct  , EndTypes.Mate);
		public static readonly StipulationType HelpMate          = new StipulationType(StipulationTypeEnum.Help    , EndTypes.Mate);
		public static readonly StipulationType SelfMate          = new StipulationType(StipulationTypeEnum.Self    , EndTypes.Mate);
		public static readonly StipulationType HelpSelfMate      = new StipulationType(StipulationTypeEnum.HelpSelf, EndTypes.Mate);

		public static readonly StipulationType DirectStaleMate   = new StipulationType(StipulationTypeEnum.Direct  , EndTypes.StaleMate);
		public static readonly StipulationType HelpStaleMate     = new StipulationType(StipulationTypeEnum.Help    , EndTypes.StaleMate);
		public static readonly StipulationType SelfStaleMate     = new StipulationType(StipulationTypeEnum.Self    , EndTypes.StaleMate);
		public static readonly StipulationType HelpSelfStaleMate = new StipulationType(StipulationTypeEnum.HelpSelf, EndTypes.StaleMate);

	}
}