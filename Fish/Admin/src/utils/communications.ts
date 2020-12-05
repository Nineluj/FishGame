type Failed = "fail"

/**
 * Did the safe call fail?
 */
export const didFail = <R>(arg: R | Failed): boolean => {
    return arg === "fail"
}

/**
 * Calls the given function safely and returns either the value
 * that it returned or a failure value if the call failed
 * @param fn
 */
export const callFunctionSafely = <R>(fn: () => R): R | Failed => {
    try {
        return fn()
    } catch {
        return "fail"
    }
}

/**
 * Like didFail but handles asynchronous functions
 */
export const didFailAsync = async <R>(arg: R | Failed): Promise<boolean> => {
    let result = await arg
    return didFail(result)
}

/**
 * Like callFunctionSafely but handles asynchronous functions
 */
export const callAsyncFunctionSafely = async <R>(
    fn: () => Promise<R>
): Promise<R | Failed> => {
    try {
        return await fn()
    } catch {
        return "fail"
    }
}
