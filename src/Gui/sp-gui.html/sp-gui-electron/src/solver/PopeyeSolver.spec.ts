import { PopeyeSolver } from "./PopeyeSolver";
describe("Popeye solver tests", () => {
  it("build", done => {
    const runner = new PopeyeSolver();
    runner.start(
      (msg) => {

      },
      () => {
        done();
      }
    );
    
  });
});
