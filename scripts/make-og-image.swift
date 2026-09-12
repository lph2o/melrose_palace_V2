// Génère les images de partage social (Open Graph / Twitter Cards) du site :
// 1200 × 630, aux couleurs de la marque, sans dépendance externe
// (CoreGraphics + CoreText, fournis par macOS).
//
// Usage :
//   swift scripts/make-og-image.swift \
//     --photo public/images/parcelles_54_drone.jpg \
//     --out public/og/og-home-fr.jpg \
//     --kicker "SÉBIKHOTANE • SÉNÉGAL" \
//     --title "Votre terrain à Sébikhotane, dès 300 €/mois" \
//     --subtitle "54 parcelles de 150 m² avec délibération municipale et NICAD, à 20 min de l'AIBD." \
//     --footer "54 PARCELLES  •  BORNAGE B1-B17  •  MUTATION ACCOMPAGNÉE"
//
// Toutes les options sont obligatoires sauf --footer.

import Foundation
import CoreGraphics
import CoreText
import ImageIO
import UniformTypeIdentifiers

/* ------------------------------------------------------------------ */
/* Arguments                                                           */
/* ------------------------------------------------------------------ */

func argValue(_ name: String) -> String? {
    let args = CommandLine.arguments
    guard let index = args.firstIndex(of: name), index + 1 < args.count else { return nil }
    return args[index + 1]
}

guard let photoPath = argValue("--photo"),
      let outPath = argValue("--out"),
      let kicker = argValue("--kicker"),
      let title = argValue("--title"),
      let subtitle = argValue("--subtitle") else {
    print("usage: swift make-og-image.swift --photo <jpg> --out <jpg> --kicker <txt> --title <txt> --subtitle <txt> [--footer <txt>]")
    exit(2)
}
let footer = argValue("--footer")

/* ------------------------------------------------------------------ */
/* Couleurs de la marque (identiques au site)                          */
/* ------------------------------------------------------------------ */

func rgb(_ r: CGFloat, _ g: CGFloat, _ b: CGFloat, _ a: CGFloat = 1) -> CGColor {
    CGColor(srgbRed: r / 255, green: g / 255, blue: b / 255, alpha: a)
}

let deepGreen = rgb(0, 38, 26)      // #00261a — fond de marque
let gold = rgb(254, 214, 91)        // #fed65b — accent doré
let goldMuted = rgb(140, 122, 83)   // #8C7A53 — or secondaire
let white = rgb(255, 255, 255)

let width = 1200
let height = 630
let margin: CGFloat = 72

guard let ctx = CGContext(
    data: nil,
    width: width,
    height: height,
    bitsPerComponent: 8,
    bytesPerRow: 0,
    space: CGColorSpaceCreateDeviceRGB(),
    bitmapInfo: CGImageAlphaInfo.noneSkipFirst.rawValue
) else {
    print("Impossible de créer le contexte de dessin")
    exit(1)
}

// Fond vert de marque (visible si la photo ne couvre pas tout).
ctx.setFillColor(deepGreen)
ctx.fill(CGRect(x: 0, y: 0, width: CGFloat(width), height: CGFloat(height)))

/* ------------------------------------------------------------------ */
/* Photo de fond, cadrée en « cover »                                  */
/* ------------------------------------------------------------------ */

if let source = CGImageSourceCreateWithURL(URL(fileURLWithPath: photoPath) as CFURL, nil),
   let image = CGImageSourceCreateImageAtIndex(source, 0, nil) {
    let canvasRatio = CGFloat(width) / CGFloat(height)
    let imageRatio = CGFloat(image.width) / CGFloat(image.height)
    var drawRect = CGRect(x: 0, y: 0, width: CGFloat(width), height: CGFloat(height))
    if imageRatio > canvasRatio {
        // Photo plus large : on recadre les côtés (centré).
        let scaledWidth = CGFloat(height) * imageRatio
        drawRect = CGRect(x: -(scaledWidth - CGFloat(width)) / 2, y: 0, width: scaledWidth, height: CGFloat(height))
    } else {
        // Photo plus haute : on recadre haut/bas en gardant le tiers supérieur.
        let scaledHeight = CGFloat(width) / imageRatio
        drawRect = CGRect(x: 0, y: -(scaledHeight - CGFloat(height)) * 0.65, width: CGFloat(width), height: scaledHeight)
    }
    ctx.draw(image, in: drawRect)
} else {
    print("⚠  Photo introuvable (\(photoPath)) — fond uni utilisé.")
}

/* ------------------------------------------------------------------ */
/* Voiles de lisibilité : assombrissement global + dégradé bas         */
/* ------------------------------------------------------------------ */

ctx.setFillColor(rgb(0, 0, 0, 0.28))
ctx.fill(CGRect(x: 0, y: 0, width: CGFloat(width), height: CGFloat(height)))

let scrimTop = CGFloat(height) * 0.20
let scrim = CGGradient(
    colorsSpace: CGColorSpaceCreateDeviceRGB(),
    colors: [rgb(0, 38, 26, 0.0), rgb(0, 38, 26, 0.92), deepGreen] as CFArray,
    locations: [0, 0.68, 1]
)
if let scrim {
    ctx.saveGState()
    ctx.clip(to: CGRect(x: 0, y: 0, width: CGFloat(width), height: CGFloat(height) - scrimTop))
    ctx.drawLinearGradient(
        scrim,
        start: CGPoint(x: 0, y: CGFloat(height) - scrimTop),
        end: CGPoint(x: 0, y: 0),
        options: []
    )
    ctx.restoreGState()
}

/* ------------------------------------------------------------------ */
/* Texte (CoreText) — mesure + retour à la ligne manuel                */
/* ------------------------------------------------------------------ */

func font(_ name: String, _ size: CGFloat) -> CTFont {
    CTFontCreateWithName(name as CFString, size, nil)
}

func line(_ text: String, fontName: String, size: CGFloat, color: CGColor, kern: CGFloat = 0) -> CTLine {
    var attributes: [CFString: Any] = [
        kCTFontAttributeName: font(fontName, size),
        kCTForegroundColorAttributeName: color,
    ]
    if kern != 0 { attributes[kCTKernAttributeName] = kern }
    let attributed = CFAttributedStringCreate(
        nil,
        text as CFString,
        attributes as CFDictionary
    )!
    return CTLineCreateWithAttributedString(attributed)
}

func textWidth(_ line: CTLine) -> CGFloat {
    CGFloat(CTLineGetTypographicBounds(line, nil, nil, nil))
}

/// Découpe un texte en lignes qui tiennent dans `maxWidth`.
func wrap(_ text: String, fontName: String, size: CGFloat, maxWidth: CGFloat, color: CGColor, kern: CGFloat = 0) -> [CTLine] {
    let words = text.split(separator: " ").map(String.init)
    var lines: [CTLine] = []
    var current = ""
    for word in words {
        let candidate = current.isEmpty ? word : "\(current) \(word)"
        let candidateLine = line(candidate, fontName: fontName, size: size, color: color, kern: kern)
        if current.isEmpty || textWidth(candidateLine) <= maxWidth {
            current = candidate
        } else {
            lines.append(line(current, fontName: fontName, size: size, color: color, kern: kern))
            current = word
        }
    }
    if !current.isEmpty {
        lines.append(line(current, fontName: fontName, size: size, color: color, kern: kern))
    }
    return lines
}

/// Dessine des lignes de haut en bas à partir de `topY` (exprimé depuis le haut).
@discardableResult
func drawLines(_ lines: [CTLine], x: CGFloat, topY: CGFloat, lineHeight: CGFloat) -> CGFloat {
    var cursor = CGFloat(height) - topY
    for current in lines {
        ctx.textPosition = CGPoint(x: x, y: cursor)
        CTLineDraw(current, ctx)
        cursor -= lineHeight
    }
    return cursor
}

func drawPill(text: String, x: CGFloat, topY: CGFloat, fill: CGColor, textColor: CGColor, fontSize: CGFloat, paddingX: CGFloat, paddingY: CGFloat) -> CGRect {
    let pillLine = line(text, fontName: "HelveticaNeue-Bold", size: fontSize, color: textColor, kern: 1.4)
    let textW = textWidth(pillLine)
    let boxWidth = textW + paddingX * 2
    let boxHeight = fontSize + paddingY * 2 + 6
    let rect = CGRect(x: x, y: CGFloat(height) - topY - boxHeight, width: boxWidth, height: boxHeight)
    let path = CGPath(roundedRect: rect, cornerWidth: boxHeight / 2, cornerHeight: boxHeight / 2, transform: nil)
    ctx.addPath(path)
    ctx.setFillColor(fill)
    ctx.fillPath()
    // Centrage vertical du texte dans la pastille.
    ctx.textPosition = CGPoint(x: rect.minX + paddingX, y: rect.midY - fontSize * 0.36)
    CTLineDraw(pillLine, ctx)
    return rect
}

/* ------------------------------------------------------------------ */
/* Composition                                                         */
/* ------------------------------------------------------------------ */

// Badge de marque « SIC » en haut à gauche.
let badgeRect = CGRect(x: margin, y: CGFloat(height) - 62 - 58, width: 58, height: 58)
ctx.addPath(CGPath(roundedRect: badgeRect, cornerWidth: 14, cornerHeight: 14, transform: nil))
ctx.setFillColor(gold)
ctx.fillPath()
let monogram = line("SIC", fontName: "Georgia-Bold", size: 24, color: deepGreen)
ctx.textPosition = CGPoint(
    x: badgeRect.midX - textWidth(monogram) / 2,
    y: badgeRect.midY - 9
)
CTLineDraw(monogram, ctx)

// Nom de la société à côté du badge.
let brand = line("Sénégal Immobilier Consulting", fontName: "Georgia-Bold", size: 25, color: white)
ctx.textPosition = CGPoint(x: badgeRect.maxX + 16, y: badgeRect.midY - 9)
CTLineDraw(brand, ctx)

// Kicker doré, en haut à droite.
let kickerLine = line(kicker.uppercased(), fontName: "HelveticaNeue-Bold", size: 17, color: gold, kern: 2.2)
ctx.textPosition = CGPoint(x: CGFloat(width) - margin - textWidth(kickerLine), y: badgeRect.midY - 6)
CTLineDraw(kickerLine, ctx)

// Titre : 2 lignes maximum, au-dessus du bloc bas.
let titleLines = Array(
    wrap(title, fontName: "Georgia-Bold", size: 58, maxWidth: CGFloat(width) - margin * 2 - 40, color: white).prefix(2)
)
let titleLineHeight: CGFloat = 68
let titleTop: CGFloat = 250

// Sous-titre : 2 lignes maximum.
let subtitleLines = Array(
    wrap(subtitle, fontName: "HelveticaNeue", size: 24, maxWidth: CGFloat(width) - margin * 2 - 120, color: rgb(255, 255, 255, 0.92)).prefix(2)
)
let subtitleLineHeight: CGFloat = 34

// Le sous-titre se place juste sous le titre ; le pied de page est ancré en bas.
let subtitleTop = titleTop + CGFloat(titleLines.count) * titleLineHeight + 18

drawLines(titleLines, x: margin, topY: titleTop, lineHeight: titleLineHeight)
drawLines(subtitleLines, x: margin, topY: subtitleTop, lineHeight: subtitleLineHeight)

// Filet doré.
let ruleY: CGFloat = 46
ctx.setFillColor(goldMuted)
ctx.fill(CGRect(x: margin, y: ruleY, width: 84, height: 3))

if let footer {
    let footerLine = line(footer.uppercased(), fontName: "HelveticaNeue-Bold", size: 16, color: rgb(255, 255, 255, 0.86), kern: 1.6)
    ctx.textPosition = CGPoint(x: margin, y: ruleY - 26)
    CTLineDraw(footerLine, ctx)
}

/* ------------------------------------------------------------------ */
/* Écriture du fichier                                                 */
/* ------------------------------------------------------------------ */

guard let output = ctx.makeImage() else {
    print("Rendu impossible")
    exit(1)
}

let outURL = URL(fileURLWithPath: outPath)
try? FileManager.default.createDirectory(at: outURL.deletingLastPathComponent(), withIntermediateDirectories: true)

guard let destination = CGImageDestinationCreateWithURL(
    outURL as CFURL,
    UTType.jpeg.identifier as CFString,
    1,
    nil
) else {
    print("Impossible d'écrire \(outPath)")
    exit(1)
}

CGImageDestinationAddImage(
    destination,
    output,
    [kCGImageDestinationLossyCompressionQuality: 0.82] as CFDictionary
)
CGImageDestinationFinalize(destination)
print("✓ \(outPath) (\(width)×\(height))")
