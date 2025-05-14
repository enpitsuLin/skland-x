export function assert(condition: any, error: Error): asserts condition
export function assert(condition: any, message: string): asserts condition
export function assert(condition: any, errorOrMessage: Error | string): asserts condition {
  if (!condition)
    throw errorOrMessage instanceof Error ? errorOrMessage : new Error(errorOrMessage)
}
