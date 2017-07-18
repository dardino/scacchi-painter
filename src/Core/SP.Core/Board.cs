using System;
using System.Collections.Generic;
using System.Text;

namespace SP.Core
{
	public class Board
	{
		private Cell[] cells = new Cell[64];
		public Board()
		{
			for (int i = 0; i < 64; i++)
			{
				cells[i] = new Cell(i);
			}
		}
	}
}
