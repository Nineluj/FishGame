type Failed = "fail"

export const didFail = <R>(arg: R | Failed): boolean => {
    return arg === "fail"
}

export const callFunctionSafely = <R>(fn: () => R): R | Failed => {
    try {
        return fn()
    } catch {}

    return "fail"
}
