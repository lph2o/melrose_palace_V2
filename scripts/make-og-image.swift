// Génère les images de partage social (Open Graph / Twitter Cards) du site :
// 1200 × 630, aux couleurs de la marque, sans dépendance externe
// (CoreGraphics + CoreText, fournis par macOS).
//
// Usage — les quatre visuels du site, un par route et par langue :
//
//   swift scripts/make-og-image.swift --photo public/images/54_parcelles.png \
//     --out public/og/og-home-fr.jpg --kicker "Sébikhotane • Sénégal" \
//     --title "Votre terrain à Sébikhotane dès 300 €/mois" \
//     --subtitle "54 parcelles de 150 m² avec délibération municipale et NICAD, à 20 min de l'AIBD." \
//     --footer "54 PARCELLES  •  BORNAGE B1-B17  •  MUTATION ACCOMPAGNÉE"
//
//   swift scripts/make-og-image.swift --photo public/images/54_parcelles.png \
//     --out public/og/og-home-en.jpg --kicker "Sebikhotane • Senegal" \
//     --title "Your plot in Sebikhotane from €300/month" \
//     --subtitle "54 plots of 150 sqm with municipal deliberation and NICAD title, 20 min from AIBD airport." \
//     --footer "54 PLOTS  •  B1-B17 MARKERS  •  GUIDED TITLE TRANSFER"
//
//   swift scripts/make-og-image.swift --photo public/images/reel_terrain_sebikhotane.jpg \
//     --out public/og/og-plan-fr.jpg --kicker "Plan cadastral • Sébikhotane" \
//     --title "Plan cadastral : les 54 parcelles en détail" \
//     --subtitle "Bornage certifié B1-B17, disponibilités en temps réel et simulateur de financement." \
//     --footer "PLAN OFFICIEL  •  DISPONIBILITÉS EN TEMPS RÉEL  •  BORNAGE B1-B17"
//
//   swift scripts/make-og-image.swift --photo public/images/reel_terrain_sebikhotane.jpg \
//     --out public/og/og-plan-en.jpg --kicker "Cadastral map • Sebikhotane" \
//     --title "Cadastral map: all 54 plots in detail" \
//     --subtitle "Certified B1-B17 boundary markers, real-time availability and financing simulator." \
//     --footer "OFFICIAL MAP  •  REAL-TIME AVAILABILITY  •  B1-B17 MARKERS"
//
// Toutes les options sont obligatoires sauf --footer.
//
// `--logo` (facultatif) place la marque complète en haut à gauche ; par défaut
// il utilise `public/logo/logo-lockup.png`, la marque du site. Le nom n'est pas
// réécrit à côté du logo : il est gravé dedans.
//
// `--kicker` et `--footer` reprennent `kicker` et `shareFooter` de
// `src/seo/routeMeta.json` (le kicker et le pied sont passés en majuscules par
// le script — les recopier tels quels). Le `--title` reprend `shareTitle` du
// même fichier, mais les `--subtitle` ont été rédigés à la main : ils ne vivent
// que dans les commandes ci-dessus, donc les relire ici avant de régénérer.
// Attention aux deux espaces autour des « • » des pieds : ils font la largeur
// du texte, un seul espace décale toute la ligne.

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
    print("usage: swift make-og-image.swift --photo <jpg> --out <jpg> --kicker <txt> --title <txt> --subtitle <txt> [--footer <txt>] [--logo <png>]")
    exit(2)
}
let footer = argValue("--footer")

// Le logo complet posé sur la carte. Surchargeable, mais le fichier par défaut
// est celui du site : c'est la marque validée, il n'y a pas de raison d'en
// générer un autre.
let logoPath = argValue("--logo") ?? "public/logo/logo-lockup.png"

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

/* ------------------------------------------------------------------ */
/* Marque : le logo entier, en haut à gauche                           */
/* ------------------------------------------------------------------ */

// Le fichier de marque est posé tel quel — emblème doré, nom « SÉNÉGAL /
// INVESTMENT CONSULTING » et filet tricolore — au lieu du seul monogramme
// « SIC ».
// Ces trois éléments font la marque, et le nom y est déjà gravé : il n'est donc
// pas répété en texte à côté (sinon le nom apparaîtrait deux fois).
//
// Le centre du bloc reprend celui de l'ancien badge, ce qui laisse le kicker
// doré exactement à la même hauteur.
let brandTop: CGFloat = 31          // depuis le bord haut de l'image
let logoHeight: CGFloat = 120
let brandCenterY = CGFloat(height) - brandTop - logoHeight / 2

if let source = CGImageSourceCreateWithURL(URL(fileURLWithPath: logoPath) as CFURL, nil),
   let logo = CGImageSourceCreateImageAtIndex(source, 0, nil) {
    let logoWidth = logoHeight * CGFloat(logo.width) / CGFloat(logo.height)
    ctx.saveGState()
    // Le filet tricolore fait 1,5 % de la hauteur du logo : sans
    // rééchantillonnage de qualité il disparaîtrait purement et simplement.
    ctx.interpolationQuality = .high
    ctx.draw(logo, in: CGRect(
        x: margin,
        y: brandCenterY - logoHeight / 2,
        width: logoWidth,
        height: logoHeight
    ))
    ctx.restoreGState()
} else {
    print("⚠  Logo introuvable (\(logoPath)) — carte sans marque.")
}

// Kicker doré, en haut à droite.
let kickerLine = line(kicker.uppercased(), fontName: "HelveticaNeue-Bold", size: 17, color: gold, kern: 2.2)
ctx.textPosition = CGPoint(x: CGFloat(width) - margin - textWidth(kickerLine), y: brandCenterY - 6)
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
