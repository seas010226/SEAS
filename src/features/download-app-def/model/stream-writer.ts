/**
 * A yielding JSON serializer that prevents main-thread blocking.
 * It walks an object tree and yields string chunks.
 */
export async function* yieldifyJSON(
  obj: any,
  timeBudgetMs = 32,
  bufferThreshold = 512 * 1024 // 512KB
): AsyncGenerator<string, void, unknown> {
  let startTime = performance.now();
  let buffer = '';

  async function* flush() {
    if (buffer.length > 0) {
      yield buffer;
      buffer = '';
    }
    // Check budget and yield control to browser
    if (performance.now() - startTime > timeBudgetMs) {
      await new Promise((resolve) => setTimeout(resolve, 0));
      startTime = performance.now();
    }
  }

  async function* walk(val: any): AsyncGenerator<string, void, unknown> {
    if (val === null) {
      buffer += 'null';
    } else if (typeof val === 'number' || typeof val === 'boolean') {
      buffer += String(val);
    } else if (typeof val === 'string') {
      buffer += JSON.stringify(val);
    } else if (Array.isArray(val)) {
      buffer += '[';
      for (let i = 0; i < val.length; i++) {
        if (i > 0) buffer += ',';
        yield* walk(val[i]);
      }
      buffer += ']';
    } else if (typeof val === 'object') {
      buffer += '{';
      const keys = Object.keys(val);
      for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        if (i > 0) buffer += ',';
        buffer += JSON.stringify(key);
        buffer += ':';
        yield* walk(val[key]);
      }
      buffer += '}';
    }

    // Flush if buffer is large or time is up
    if (buffer.length > bufferThreshold || performance.now() - startTime > timeBudgetMs) {
      yield* flush();
    }
  }

  yield* walk(obj);
  yield* flush(); // Final flush
}
