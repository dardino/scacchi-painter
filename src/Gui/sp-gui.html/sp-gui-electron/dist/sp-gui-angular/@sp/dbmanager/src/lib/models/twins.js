"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Twins = void 0;
const helpers_1 = require("../helpers");
const twin_1 = require("./twin");
class Twins {
    constructor() {
        this.TwinList = [twin_1.Twin.fromJson({ TwinModes: helpers_1.TwinModes.Normal, TwinType: helpers_1.TwinTypes.Diagram })];
        this.TwinSequenceTypes = helpers_1.SequnceTypes.Normal;
    }
    static fromElement(el) {
        const t = new Twins();
        if (el == null)
            return t;
        t.TwinSequenceTypes =
            helpers_1.SequnceTypes[el.getAttribute("TwinSequenceTypes") ||
                "Normal"];
        t.TwinList = Array.from(el.querySelectorAll("Twin")).map(twin_1.Twin.fromElement);
        if (t.TwinList.length === 0)
            t.TwinList.push(twin_1.Twin.fromJson({ TwinModes: helpers_1.TwinModes.Normal, TwinType: helpers_1.TwinTypes.Diagram }));
        return t;
    }
    static fromJson(twins) {
        const p = new Twins();
        if (twins == null)
            return p;
        if (twins.TwinSequenceTypes != null) {
            p.TwinSequenceTypes = twins.TwinSequenceTypes;
        }
        p.TwinList = (twins.TwinList || []).map(twin_1.Twin.fromJson);
        if (p.TwinList.length === 0)
            p.TwinList.push(twin_1.Twin.fromJson({ TwinModes: helpers_1.TwinModes.Normal, TwinType: helpers_1.TwinTypes.Diagram }));
        return p;
    }
    toJson() {
        const p = {};
        if (this.TwinSequenceTypes !== helpers_1.SequnceTypes.Normal)
            p.TwinSequenceTypes = this.TwinSequenceTypes;
        if (this.TwinList.length > 0)
            p.TwinList = this.TwinList.map(t => t.toJson());
        return p;
    }
    toSP2Xml() {
        const twins = helpers_1.createXmlElement("Twins");
        twins.setAttribute("TwinSequenceTypes", this.TwinSequenceTypes);
        this.TwinList.forEach(t => {
            twins.appendChild(t.toSP2Xml());
        });
        return twins;
    }
}
exports.Twins = Twins;
//# sourceMappingURL=twins.js.map