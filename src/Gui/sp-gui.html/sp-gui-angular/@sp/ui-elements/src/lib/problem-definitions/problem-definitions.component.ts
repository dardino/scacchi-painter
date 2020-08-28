import { Component, OnInit } from "@angular/core";

@Component({
  selector: "lib-problem-definitions",
  templateUrl: "./problem-definitions.component.html",
  styleUrls: ["./problem-definitions.component.styl"],
})
export class ProblemDefinitionsComponent implements OnInit {

  public moveNumber = 2;

  constructor() {}

  ngOnInit(): void {}
}


/*

						                              {#= }	      {#=  }
						                              {!= }	      {!=  }
						                              {!# }       {!#  }
						                              {00 }	      {00  }
						                              {%  }	      {%	 }
						                              {~  }	      {~	 }
						                              {ep }	      {ep  }
          {SER- }              {H }	      {#  }	      {#	 }
			    {PSER-}              {S }	      {=  }	      {=	 }
	{m->} + {EXACT-} + {PHSER-}+ {R } + ( + {== } + ) + {==  } + n
			    {SEMI-}              {HS}	      {+  }	      {+	 }
			    {RECI-}              {HR}	      {Zxy}	      {Zxy }
						                              {x  }	      {x	 }
						                              {## }	      {##  }
						                              {##!}	      {##! }
						                              {ct }	      {ct  }
						                              {<> }	      {<>  }
						                              {ctr}	      {ctr }
						                              {<>r}	      {<>r }
						                              {c81}	      {c81 }
							                                        {Kxy }

							                                        {dia } + n{.5}
			    {SER-}	                                  + {dia } + n
							                                        {a=>b} + n{.5}
			    {SER-}			                              + {a=>b} + n

	(m, n are the number of moves)


*/
