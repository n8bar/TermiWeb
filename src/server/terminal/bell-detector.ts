const BEL = String.fromCharCode(0x07);
const ESC = String.fromCharCode(0x1b);
const OSC_C1 = String.fromCharCode(0x9d);
const ST_C1 = String.fromCharCode(0x9c);

/**
 * Counts terminal bells in a PTY output stream. A BEL byte that terminates an
 * OSC sequence (title changes and the like) is not a bell. Parser state carries
 * across chunks because a sequence can be split between two writes.
 */
export class BellDetector {
  #escapePending = false;
  #inOsc = false;

  feed(chunk: string): number {
    let bells = 0;

    for (const char of chunk) {
      if (this.#inOsc) {
        if (this.#escapePending) {
          this.#escapePending = false;
          if (char === "\\") {
            this.#inOsc = false;
          }
          continue;
        }

        if (char === BEL || char === ST_C1) {
          this.#inOsc = false;
        } else if (char === ESC) {
          this.#escapePending = true;
        }
        continue;
      }

      if (this.#escapePending) {
        this.#escapePending = false;
        if (char === "]") {
          this.#inOsc = true;
        }
        continue;
      }

      if (char === ESC) {
        this.#escapePending = true;
      } else if (char === OSC_C1) {
        this.#inOsc = true;
      } else if (char === BEL) {
        bells += 1;
      }
    }

    return bells;
  }
}
