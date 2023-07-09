var popeyeInputFile = "/test.inp";
var popeyeMaxMem = "128M";
var args = ["py", "-maxmem", popeyeMaxMem, popeyeInputFile];
declare const FS: any;
declare const allocate: any;
declare const intArrayFromString: any;
declare const _malloc: any;
declare const _main: any;
declare const _free: any;
declare const HEAPU8: any;
declare const ALLOC_NORMAL: any;

var Module: any = {
    noInitialRun: true
};
Module.printErr = (text: string) => {
    postMessage(text);
};
Module.print = (text: string) => {
    postMessage(text);
};

function solve(problem: string) {

    FS.writeFile(popeyeInputFile, problem);

    var argv = new Uint32Array(args.length);
    for (var i = 0; i < args.length; i++) {
        argv[i] = allocate(intArrayFromString(args[i]), 'i8', ALLOC_NORMAL);
    }
    var bytes = argv.length * argv.BYTES_PER_ELEMENT;
    var ptrArgv = _malloc(bytes);
    var pointerHeap = new Uint8Array(HEAPU8.buffer, ptrArgv, bytes);
    pointerHeap.set(new Uint8Array(argv.buffer));

    _main(args.length, pointerHeap.byteOffset);

    for (var i = 0; i < args.length; i++) {
        _free(argv[i]);
    }
    _free(ptrArgv);
}

onmessage = (e: MessageEvent) => {
    console.log('Worker: Message received from main script');
    const result = e.data as { problem: string };
    if (typeof result.problem != "string") {
      postMessage('ERR: invalid argument');
    } else {
      console.log('Worker: Posting message back to main script');
      postMessage("Starting popeye");
      solve(result.problem);
    }
  }
