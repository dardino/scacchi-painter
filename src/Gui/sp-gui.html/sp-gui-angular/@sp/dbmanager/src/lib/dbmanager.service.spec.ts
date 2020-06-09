import { TestBed } from "@angular/core/testing";

import { DbmanagerService } from "./dbmanager.service";

describe("DbmanagerService", () => {
  let service: DbmanagerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DbmanagerService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });

  describe("parsing SP2", () => {
    const fileSample = `<ScacchiPainterDatabase version="0.1.0.3" name="Scacchi Painter 2 Database" lastIndex="0">
    <SP_Item ProblemType="Direct" Moves="2" Date="2020-06-07T22:00:00Z" Maximum="false" Serie="false" PrizeRank="0" CompleteStipulationDesc="#" PersonalID="" PrizeDescription="" Source="" Stipulation="Mate">
      <Authors />
      <Pieces>
        <Piece Type="King" Color="White" Column="ColA" Traverse="Row8" Rotation="NoRotation" FairyAttribute="None" />
        <Piece Type="Queen" Color="White" Column="ColB" Traverse="Row8" Rotation="NoRotation" FairyAttribute="None" />
        <Piece Type="Rock" Color="White" Column="ColC" Traverse="Row8" Rotation="NoRotation" FairyAttribute="None" />
        <Piece Type="Bishop" Color="White" Column="ColD" Traverse="Row8" Rotation="NoRotation" FairyAttribute="None" />
        <Piece Type="Horse" Color="White" Column="ColE" Traverse="Row8" Rotation="NoRotation" FairyAttribute="None" />
        <Piece Type="Pawn" Color="White" Column="ColF" Traverse="Row8" Rotation="NoRotation" FairyAttribute="None" />
        <Piece Type="King" Color="Black" Column="ColA" Traverse="Row7" Rotation="NoRotation" FairyAttribute="None" />
        <Piece Type="Queen" Color="Black" Column="ColB" Traverse="Row7" Rotation="NoRotation" FairyAttribute="None" />
        <Piece Type="Rock" Color="Black" Column="ColC" Traverse="Row7" Rotation="NoRotation" FairyAttribute="None" />
        <Piece Type="Bishop" Color="Black" Column="ColD" Traverse="Row7" Rotation="NoRotation" FairyAttribute="None" />
        <Piece Type="Horse" Color="Black" Column="ColE" Traverse="Row7" Rotation="NoRotation" FairyAttribute="None" />
        <Piece Type="Pawn" Color="Black" Column="ColF" Traverse="Row7" Rotation="NoRotation" FairyAttribute="None" />
        <Piece Type="King" Color="Both" Column="ColA" Traverse="Row6" Rotation="NoRotation" FairyAttribute="None" />
        <Piece Type="Queen" Color="Both" Column="ColB" Traverse="Row6" Rotation="NoRotation" FairyAttribute="None" />
        <Piece Type="Rock" Color="Both" Column="ColC" Traverse="Row6" Rotation="NoRotation" FairyAttribute="None" />
        <Piece Type="Bishop" Color="Both" Column="ColD" Traverse="Row6" Rotation="NoRotation" FairyAttribute="None" />
        <Piece Type="Horse" Color="Both" Column="ColE" Traverse="Row6" Rotation="NoRotation" FairyAttribute="None" />
        <Piece Type="Pawn" Color="Both" Column="ColF" Traverse="Row6" Rotation="NoRotation" FairyAttribute="None" />
        <Piece Type="HorseQueen" Color="White" Column="ColA" Traverse="Row4" Rotation="NoRotation" FairyAttribute="None" />
        <Piece Type="HorseTower" Color="White" Column="ColB" Traverse="Row4" Rotation="NoRotation" FairyAttribute="None" />
        <Piece Type="HorseBishop" Color="White" Column="ColC" Traverse="Row4" Rotation="NoRotation" FairyAttribute="None" />
        <Piece Type="Queen" Color="White" Column="ColE" Traverse="Row4" Rotation="NoRotation" FairyAttribute="None" />
        <Piece Type="Queen" Color="White" Column="ColF" Traverse="Row4" Rotation="Clockwise45" FairyAttribute="None" />
        <Piece Type="Queen" Color="White" Column="ColG" Traverse="Row4" Rotation="Clockwise90" FairyAttribute="None" />
        <Piece Type="Queen" Color="White" Column="ColH" Traverse="Row4" Rotation="Clockwise135" FairyAttribute="None" />
        <Piece Type="HorseQueen" Color="Black" Column="ColA" Traverse="Row3" Rotation="NoRotation" FairyAttribute="None" />
        <Piece Type="HorseTower" Color="Black" Column="ColB" Traverse="Row3" Rotation="NoRotation" FairyAttribute="None" />
        <Piece Type="HorseBishop" Color="Black" Column="ColC" Traverse="Row3" Rotation="NoRotation" FairyAttribute="None" />
        <Piece Type="Queen" Color="White" Column="ColE" Traverse="Row3" Rotation="UpsideDown" FairyAttribute="None" />
        <Piece Type="Queen" Color="White" Column="ColF" Traverse="Row3" Rotation="Counterclockwise135" FairyAttribute="None" />
        <Piece Type="Queen" Color="White" Column="ColG" Traverse="Row3" Rotation="Counterclockwise90" FairyAttribute="None" />
        <Piece Type="Queen" Color="White" Column="ColH" Traverse="Row3" Rotation="Counterclockwise45" FairyAttribute="None" />
        <Piece Type="HorseQueen" Color="Both" Column="ColA" Traverse="Row2" Rotation="NoRotation" FairyAttribute="None" />
        <Piece Type="HorseTower" Color="Both" Column="ColB" Traverse="Row2" Rotation="NoRotation" FairyAttribute="None" />
        <Piece Type="HorseBishop" Color="Both" Column="ColC" Traverse="Row2" Rotation="NoRotation" FairyAttribute="None" />
      </Pieces>
      <Twins TwinSequenceTypes="Normal" />
      <Conditions />
      <Solution></Solution>
      <SolutionRtf>e1xydGYxXGFuc2lcYW5zaWNwZzEyNTJcZGVmZjBcZGVmbGFuZzEwMzN7XGZvbnR0Ymx7XGYwXGZuaWxcZmNoYXJzZXQwIEZpcmEgQ29kZSBSZXRpbmE7fX0NClx2aWV3a2luZDRcdWMxXHBhcmRcYlxmMFxmczI5XHBhcg0KfQ0K</SolutionRtf>
    </SP_Item>
  </ScacchiPainterDatabase>`;


    it("Rotations", () => {
      service.LoadFromText(fileSample, "sample.sp2");
      expect(service.CurrentProblem?.getCurrentFen()).toBe(
        "KQRBNP2/kqrbnp2/*K*Q*R*B*N*P2/8/ETA1QQ:1Q:2Q:3/eta1Q:4Q:5Q:6Q:7/*E*T*A5/8"
      );
    });
  });
});
