export async function getJSON(url: string, { method = "GET", body = undefined, returnJSON = true, headers = undefined } = {}) {
    try {
        const res = await fetch(url, { method, body, headers });
        if (res.status !== 200) return null;
        return await res[returnJSON ? "json" : "text"]()
    } catch {
        return null;
    }
}
