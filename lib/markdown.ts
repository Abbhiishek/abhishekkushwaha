import fs from "fs"
import path from "path"
import showdown from "showdown"

interface Frontmatter {
    [key: string]: string
}

interface ParsedMarkdown {
    frontmatter: Frontmatter
    html: string
    raw: string
}

function parseFrontmatter(content: string): { frontmatter: Frontmatter; body: string } {
    const frontmatter: Frontmatter = {}

    if (!content.startsWith("---")) {
        return { frontmatter, body: content }
    }

    const endIndex = content.indexOf("---", 3)
    if (endIndex === -1) {
        return { frontmatter, body: content }
    }

    const frontmatterBlock = content.slice(3, endIndex).trim()
    const body = content.slice(endIndex + 3).trim()

    for (const line of frontmatterBlock.split("\n")) {
        const colonIndex = line.indexOf(":")
        if (colonIndex === -1) continue

        const key = line.slice(0, colonIndex).trim()
        let value = line.slice(colonIndex + 1).trim()

        // Strip surrounding quotes
        if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
            value = value.slice(1, -1)
        }

        frontmatter[key] = value
    }

    return { frontmatter, body }
}

export function parseMarkdownFile(filePath: string): ParsedMarkdown {
    const content = fs.readFileSync(filePath, "utf8")
    const { frontmatter, body } = parseFrontmatter(content)
    const converter = new showdown.Converter({
        metadata: true,
        tables: true,
        ghCodeBlocks: true,
        tasklists: true,
        strikethrough: true,
        ghMentions: false,
        simplifiedAutoLink: true,
        openLinksInNewWindow: true,
    })
    const html = converter.makeHtml(body)

    return { frontmatter, html, raw: body }
}

export function getMarkdownFiles(dirPath: string): string[] {
    if (!fs.existsSync(dirPath)) return []
    return fs
        .readdirSync(dirPath)
        .filter((f) => f.endsWith(".md"))
        .map((f) => path.join(dirPath, f))
}

export function estimateReadingTime(text: string): number {
    const words = text.split(/\s+/).length
    return Math.max(1, Math.ceil(words / 200))
}
