import { ImageResponse } from "next/og"
import type { NextRequest } from "next/server"
import { profileImagePath } from "@/lib/site"

export const runtime = "edge"

const size = {
    width: 1200,
    height: 630,
}

function clean(value: string | null, fallback: string) {
    return (value || fallback).slice(0, 140)
}

function titleSize(title: string) {
    if (title.length > 84) return 54
    if (title.length > 58) return 64
    return 76
}

export async function GET(request: NextRequest) {
    const requestUrl = new URL(request.url)
    const { searchParams } = requestUrl
    const title = clean(searchParams.get("title"), "home@abhishekkushwaha")
    const eyebrow = clean(searchParams.get("eyebrow"), "Abhishek Kushwaha")
    const background = clean(searchParams.get("background"), title)
    const profileImage = `${requestUrl.origin}${profileImagePath}`

    return new ImageResponse(
        (
            <div
                style={{
                    width: "100%",
                    height: "100%",
                    position: "relative",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    overflow: "hidden",
                    background:
                        "radial-gradient(circle at 18% 18%, rgba(168, 85, 247, 0.42), transparent 32%), radial-gradient(circle at 84% 78%, rgba(251, 146, 60, 0.48), transparent 34%), linear-gradient(135deg, #070711 0%, #11111a 42%, #1a1020 70%, #26130b 100%)",
                    color: "white",
                    fontFamily: "Inter, Arial, sans-serif",
                }}
            >
                <div
                    style={{
                        position: "absolute",
                        inset: 0,
                        opacity: 0.16,
                        backgroundImage:
                            "linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)",
                        backgroundSize: "54px 54px",
                    }}
                />
                <div
                    style={{
                        position: "absolute",
                        left: -30,
                        right: -30,
                        top: 46,
                        display: "flex",
                        justifyContent: "center",
                        fontSize: 176,
                        fontWeight: 900,
                        letterSpacing: -6,
                        lineHeight: 1,
                        color: "rgba(255,255,255,0.035)",
                        textTransform: "uppercase",
                        whiteSpace: "nowrap",
                    }}
                >
                    {background}
                </div>
                <div
                    style={{
                        position: "absolute",
                        left: 56,
                        top: 50,
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        fontSize: 20,
                        letterSpacing: 6,
                        textTransform: "uppercase",
                        color: "rgba(255,255,255,0.62)",
                    }}
                >
                    <span
                        style={{
                            width: 10,
                            height: 10,
                            borderRadius: 999,
                            background: "#fb923c",
                            display: "flex",
                        }}
                    />
                    {eyebrow}
                </div>
                <div
                    style={{
                        position: "absolute",
                        right: 56,
                        top: 44,
                        width: 70,
                        height: 70,
                        borderRadius: 20,
                        border: "1px solid rgba(255,255,255,0.18)",
                        background: `rgba(255,255,255,0.06) url(${profileImage}) center / cover`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        overflow: "hidden",
                    }}
                />
                <div
                    style={{
                        width: 980,
                        minHeight: 330,
                        border: "1px solid rgba(255,255,255,0.14)",
                        borderRadius: 36,
                        background:
                            "linear-gradient(135deg, rgba(255,255,255,0.12), rgba(255,255,255,0.045))",
                        boxShadow: "0 34px 120px rgba(0,0,0,0.36)",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "54px 70px",
                        textAlign: "center",
                    }}
                >
                    <div
                        style={{
                            fontSize: titleSize(title),
                            lineHeight: 1.04,
                            fontWeight: 900,
                            letterSpacing: -2,
                            color: "#fff7ed",
                            textWrap: "balance",
                        }}
                    >
                        {title}
                    </div>
                    <div
                        style={{
                            marginTop: 30,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 16,
                            fontSize: 25,
                            color: "rgba(255,255,255,0.72)",
                        }}
                    >
                        <span
                            style={{
                                width: 84,
                                height: 2,
                                background:
                                    "linear-gradient(90deg, transparent, rgba(251,146,60,0.9))",
                                display: "flex",
                            }}
                        />
                        Abhishek Kushwaha
                        <span
                            style={{
                                width: 84,
                                height: 2,
                                background:
                                    "linear-gradient(90deg, rgba(168,85,247,0.9), transparent)",
                                display: "flex",
                            }}
                        />
                    </div>
                </div>
                <div
                    style={{
                        position: "absolute",
                        left: 58,
                        bottom: 46,
                        fontSize: 21,
                        color: "rgba(255,255,255,0.5)",
                    }}
                >
                    AI product engineer / real-time intelligent systems
                </div>
                <div
                    style={{
                        position: "absolute",
                        right: 58,
                        bottom: 46,
                        fontSize: 21,
                        color: "rgba(255,255,255,0.5)",
                    }}
                >
                    {requestUrl.host}
                </div>
            </div>
        ),
        size
    )
}
