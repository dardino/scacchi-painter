import { ITwins, SequnceTypes, TwinModes } from "../helpers";
import { Twin } from "./twin";
import { Twins } from "./twins";

describe("Twins - fromJson", () => {
  it("should create Twins instance from JSON", () => {
    const json: ITwins = {
      TwinList: [
        {
          TwinModes: TwinModes.Normal,
          TwinType: "Diagram",
          ValueA: "",
          ValueB: "",
          ValueC: ""
        },
        {
          TwinModes: TwinModes.Normal,
          TwinType: "Custom",
          ValueA: "",
          ValueB: "",
          ValueC: ""
        },
      ],
      TwinSequenceTypes: SequnceTypes.Normal,
    };

    const twins = Twins.fromJson(json);

    expect(twins.TwinList.length).toBe(2);
    expect(twins.TwinList[0].TwinModes).toBe(TwinModes.Normal);
    expect(twins.TwinList[0].TwinType).toBe("Diagram");
    expect(twins.TwinList[1].TwinModes).toBe(TwinModes.Normal);
    expect(twins.TwinList[1].TwinType).toBe("Custom");
    expect(twins.TwinSequenceTypes).toBe(SequnceTypes.Normal);
  });

  it("should handle null or undefined input", () => {
    const twins1 = Twins.fromJson(null);
    expect(twins1.TwinList.length).toBe(1);
    expect(twins1.TwinList[0].TwinModes).toBe(TwinModes.Normal);
    expect(twins1.TwinList[0].TwinType).toBe("Diagram");
    expect(twins1.TwinSequenceTypes).toBe(SequnceTypes.Normal);

    const twins2 = Twins.fromJson(undefined);
    expect(twins2.TwinList.length).toBe(1);
    expect(twins2.TwinList[0].TwinModes).toBe(TwinModes.Normal);
    expect(twins2.TwinList[0].TwinType).toBe("Diagram");
    expect(twins2.TwinSequenceTypes).toBe(SequnceTypes.Normal);
  });

  it("should handle empty TwinList", () => {
    const json: ITwins = {
      TwinList: [],
      TwinSequenceTypes: SequnceTypes.Normal,
    };

    const twins = Twins.fromJson(json);

    expect(twins.TwinList.length).toBe(1);
    expect(twins.TwinList[0].TwinModes).toBe(TwinModes.Normal);
    expect(twins.TwinList[0].TwinType).toBe("Diagram");
    expect(twins.TwinSequenceTypes).toBe(SequnceTypes.Normal);
  });

  it("should handle sigle TwinList", () => {
    const json: ITwins = {
      TwinList: [{
          TwinModes: TwinModes.Normal,
          TwinType: "Diagram",
          ValueA: "",
          ValueB: "",
          ValueC: ""
        }],
      TwinSequenceTypes: SequnceTypes.Normal,
    };

    const twins = Twins.fromJson(json);

    expect(twins.TwinList.length).toBe(1);
    expect(twins.TwinList[0].TwinModes).toBe(TwinModes.Normal);
    expect(twins.TwinList[0].TwinType).toBe("Diagram");
    expect(twins.TwinSequenceTypes).toBe(SequnceTypes.Normal);
  });

  it("should handle multiple 'Diagram' Twins", () => {
    const json: ITwins = {
      TwinList: [
        {
          TwinModes: TwinModes.Normal,
          TwinType: "Diagram",
          ValueA: "",
          ValueB: "",
          ValueC: ""
        },
        {
          TwinModes: TwinModes.Normal,
          TwinType: "Diagram",
          ValueA: "",
          ValueB: "",
          ValueC: ""
        },
        {
          TwinModes: TwinModes.Normal,
          TwinType: "Custom",
          ValueA: "",
          ValueB: "",
          ValueC: ""
        },
      ],
      TwinSequenceTypes: SequnceTypes.Normal,
    };

    const twins = Twins.fromJson(json);

    expect(twins.TwinList.length).toBe(2);
    expect(twins.TwinList[0].TwinModes).toBe(TwinModes.Normal);
    expect(twins.TwinList[0].TwinType).toBe("Diagram");
    expect(twins.TwinList[1].TwinModes).toBe(TwinModes.Normal);
    expect(twins.TwinList[1].TwinType).toBe("Custom");
    expect(twins.TwinSequenceTypes).toBe(SequnceTypes.Normal);
  });

  it("should add 'Diagram' Twin if TwinList is empty or doesn't have 'Diagram'", () => {
    const json1: ITwins = {
      TwinList: [],
      TwinSequenceTypes: SequnceTypes.Normal,
    };

    const twins1 = Twins.fromJson(json1);

    expect(twins1.TwinList.length).toBe(1);
    expect(twins1.TwinList[0].TwinModes).toBe(TwinModes.Normal);
    expect(twins1.TwinList[0].TwinType).toBe("Diagram");
    expect(twins1.TwinSequenceTypes).toBe(SequnceTypes.Normal);

    const json2: ITwins = {
      TwinList: [
        {
          TwinModes: TwinModes.Normal,
          TwinType: "Custom",
          ValueA: "",
          ValueB: "",
          ValueC: ""
        },
      ],
      TwinSequenceTypes: SequnceTypes.Normal,
    };

    const twins2 = Twins.fromJson(json2);

    expect(twins2.TwinList.length).toBe(2);
    expect(twins2.TwinList[0].TwinModes).toBe(TwinModes.Normal);
    expect(twins2.TwinList[0].TwinType).toBe("Diagram");
    expect(twins2.TwinList[1].TwinModes).toBe(TwinModes.Normal);
    expect(twins2.TwinList[1].TwinType).toBe("Custom");
    expect(twins2.TwinSequenceTypes).toBe(SequnceTypes.Normal);
  });
});
describe("Twins - HasDiagram", () => {
  it ("should have diagram if is the only one", () => {
    const twins: ITwins = {
      TwinList: [
        {
          TwinModes: TwinModes.Normal,
          TwinType: "Diagram",
          ValueA: "",
          ValueB: "",
          ValueC: ""
        },
      ],
      TwinSequenceTypes: SequnceTypes.Normal,
    };
    const p = Twins.fromJson({});
    p.TwinList = (twins.TwinList ?? []).map(Twin.fromJson);
    expect(p.HasDiagram).toBeTrue();

  })
})
