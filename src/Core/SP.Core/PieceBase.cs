using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;

namespace SP.Core
{
    public abstract class PieceBase
    {
        public PieceColors Color { get; set; } = PieceColors.Neutral;
        public PieceRotation Rotation { get; set; } = PieceRotation.NoRotation;

        public string Name { get; set; }

        private Lazy<string> nameByColor => new Lazy<string>(() => Color == PieceColors.Black ? Name.ToLower() : Name.ToUpper());
        public string NameByColor => nameByColor.Value;
    }

}
