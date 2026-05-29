export const productionSiteUrl = "https://abhishekkushwaha.vercel.app"
export const localSiteUrl = "http://localhost:3000"
export const profileImagePath = "/me.webp"

export function getSiteUrl() {
    return process.env.NODE_ENV === "development" ? localSiteUrl : productionSiteUrl
}

export function getSiteHost() {
    return new URL(getSiteUrl()).host
}
