"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Twin = void 0;
const helpers_1 = require("../helpers");
class Twin {
    constructor() {
        this.TwinType = helpers_1.TwinTypes.Diagram;
        this.TwinModes = helpers_1.TwinModes.Normal;
        this.ValueA = "";
        this.ValueB = "";
        this.ValueC = "";
    }
    static fromElement(el) {
        var _a, _b, _c, _d, _e;
        const t = new Twin();
        t.TwinType =
            helpers_1.TwinTypes[(_a = el.getAttribute("TwinType")) !== null && _a !== void 0 ? _a : "Diagram"];
        t.TwinModes =
            helpers_1.TwinModes[(_b = el.getAttribute("TwinModes")) !== null && _b !== void 0 ? _b : "Normal"];
        t.ValueA = (_c = el.getAttribute("ValueA")) !== null && _c !== void 0 ? _c : "";
        t.ValueB = (_d = el.getAttribute("ValueB")) !== null && _d !== void 0 ? _d : "";
        t.ValueC = (_e = el.getAttribute("ValueC")) !== null && _e !== void 0 ? _e : "";
        return t;
    }
    static fromJson(fromJson) {
        var _a, _b, _c, _d, _e;
        const t = new Twin();
        t.TwinType = (_a = fromJson.TwinType) !== null && _a !== void 0 ? _a : helpers_1.TwinTypes.Diagram;
        t.TwinModes = (_b = fromJson.TwinModes) !== null && _b !== void 0 ? _b : helpers_1.TwinModes.Normal;
        t.ValueA = (_c = fromJson.ValueA) !== null && _c !== void 0 ? _c : "";
        t.ValueB = (_d = fromJson.ValueB) !== null && _d !== void 0 ? _d : "";
        t.ValueC = (_e = fromJson.ValueC) !== null && _e !== void 0 ? _e : "";
        return t;
    }
    toString() {
        return twinmapper[this.TwinType](this.ValueA, this.ValueB, this.ValueC);
    }
    toSP2Xml() {
        const twin = helpers_1.createXmlElement("Twin");
        twin.setAttribute("TwinType", this.TwinType);
        twin.setAttribute("ValueA", this.ValueA);
        twin.setAttribute("ValueB", this.ValueB);
        twin.setAttribute("ValueC", this.ValueC);
        twin.setAttribute("TwinModes", this.TwinModes);
        return twin;
    }
    toJson() {
        const twin = {
            TwinType: this.TwinType,
            ValueA: this.ValueA,
            ValueB: this.ValueB,
            ValueC: this.ValueC,
            TwinModes: this.TwinModes,
        };
        return twin;
    }
}
exports.Twin = Twin;
const twinmapper = {
    [helpers_1.TwinTypes.Custom]: (...args) => args.join(" ").trim(),
    [helpers_1.TwinTypes.Diagram]: () => `Diagram`,
    [helpers_1.TwinTypes.MovePiece]: (...args) => `${args[0]} -> ${args[1]}`.trim(),
    [helpers_1.TwinTypes.RemovePiece]: (...args) => `- ${args[0]}`.trim(),
    [helpers_1.TwinTypes.AddPiece]: (...args) => `+ ${args[0]} ${args[1]} ${args[2]}`.trim(),
    [helpers_1.TwinTypes.Substitute]: (...args) => `${args[0]} ==> ${args[1]}`.trim(),
    [helpers_1.TwinTypes.SwapPieces]: (...args) => `${args[0]} <-> ${args[1]}`.trim(),
    [helpers_1.TwinTypes.Rotation90]: () => `Rotation 90°`.trim(),
    [helpers_1.TwinTypes.Rotation180]: () => `Rotation 180°`.trim(),
    [helpers_1.TwinTypes.Rotation270]: () => `Rotation 270°`.trim(),
    [helpers_1.TwinTypes.TraslateNormal]: (...args) => `Traslate: ${args[0]} -> ${args[1]}`.trim(),
    [helpers_1.TwinTypes.TraslateToroidal]: (...args) => `Toroidal Tr.: ${args[0]} -> ${args[1]}`.trim(),
    [helpers_1.TwinTypes.MirrorHorizontal]: () => `Horizz. Mirror`.trim(),
    [helpers_1.TwinTypes.MirrorVertical]: () => `Vert. Mirror`.trim(),
    [helpers_1.TwinTypes.ChangeProblemType]: (...args) => `ChangeType: ${args[0]} ${args[1]} ${args[2]}"`.trim(),
    [helpers_1.TwinTypes.Duplex]: () => `Duplex`.trim(),
    [helpers_1.TwinTypes.AfterKey]: () => `After Key`.trim(),
    [helpers_1.TwinTypes.SwapColors]: () => `Swap colors`.trim(),
    [helpers_1.TwinTypes.Stipulation]: (...args) => `Stipulation > ${args[0]}`.trim(),
};
//# sourceMappingURL=twin.js.map