using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;

namespace SP.Core
{
    public abstract class PieceBase
    {
        public PieceColors Color;
        public PieceRotation Rotation;
        public string Name;
        public string NameByColor => Color == PieceColors.Black ? Name.ToLower() : Name.ToUpper();
    }

}
