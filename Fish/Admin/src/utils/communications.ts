export const callFunctionSafely = <R>(fn: () => R): R | false => {
    try {
        return fn()
    } catch {}

    return false
}
