// Génère les assets de marque du site à partir du logo fourni par le gérant :
// la marque détourée (`public/logo/logo-lockup.png`) et les favicons.
// Sans dépendance externe (CoreGraphics + ImageIO, fournis par macOS).
//
// Usage — à COMPILER avant de lancer : l'interpréteur `swift` ne résout pas
// `CGContext.draw(_:in:)` (erreur « JIT session error: Symbols not found »).
//
//   swiftc -O scripts/make-brand-assets.swift -o /tmp/make-brand
//   /tmp/make-brand --source public/logo/03-logo-senegal-immo-consulting.jpeg
//
// Sorties :
//
//   public/logo/logo-lockup.png     marque complète, fond transparent, rognée
//   public/favicon.png              192 × 192, marque sur le vert de marque
//   public/apple-touch-icon.png     180 × 180, même composition
//   public/favicon.ico              16 / 32 / 48, même composition
//
// POURQUOI LE DÉTOURAGE : le logo arrive en JPEG sur fond noir. Tel quel, il
// poserait un rectangle noir sur les surfaces vertes du site (navbar, pied de
// page, en-têtes sombres). Le fond est donc converti en transparence, et les
// bords anti-aliasés sont « dé-prémultipliés » pour ne pas laisser de liseré.
//
// LA COMPOSITION EST REPRISE TELLE QUELLE, sans rien recomposer : l'emblème
// doré, le nom gravé et le filet tricolore comptent autant l'un que l'autre et
// ne doivent jamais être dissociés. Ne pas rogner un élément pour « faire
// tenir » la marque quelque part : la réduire, elle, reste lisible parce que
// le fichier garde toute sa résolution.
//
// Seuils : le fond d'un JPEG n'est jamais exactement noir (bruit de
// compression). `--floor` est le niveau en dessous duquel tout est transparent,
// `--ceil` celui au-dessus duquel tout est opaque. Entre les deux, l'alpha est
// interpolé : c'est ce qui garde les bords du filet tricolore propres.

import Foundation
import CoreGraphics
import ImageIO
import UniformTypeIdentifiers

/* ------------------------------------------------------------------ */
/* Arguments                                                           */
/* ------------------------------------------------------------------ */

func argValue(_ name: String, default fallback: String) -> String {
    let args = CommandLine.arguments
    guard let index = args.firstIndex(of: name), index + 1 < args.count else { return fallback }
    return args[index + 1]
}

let projectRoot = URL(fileURLWithPath: FileManager.default.currentDirectoryPath)
let sourcePath = argValue("--source", default: "public/logo/03-logo-senegal-immo-consulting.jpeg")
let outDir = argValue("--out-dir", default: "public")
let logoOut = argValue("--logo-out", default: "public/logo/logo-lockup.png")
let floorLevel = (Double(argValue("--floor", default: "8")) ?? 8) / 255.0
let ceilLevel = (Double(argValue("--ceil", default: "32")) ?? 32) / 255.0

/// Vert de marque du site (`--color-primary` dans `src/index.css`).
let brandGreen = (r: 0, g: 38, b: 26)

/* ------------------------------------------------------------------ */
/* Chargement du JPEG source                                           */
/* ------------------------------------------------------------------ */

guard let source = CGImageSourceCreateWithURL(URL(fileURLWithPath: sourcePath) as CFURL, nil),
      let image = CGImageSourceCreateImageAtIndex(source, 0, nil) else {
    print("Impossible d'ouvrir l'image : \(sourcePath)")
    exit(1)
}

let width = image.width
let height = image.height
var pixels = [UInt8](repeating: 0, count: width * height * 4)

guard let readContext = CGContext(
    data: &pixels,
    width: width,
    height: height,
    bitsPerComponent: 8,
    bytesPerRow: width * 4,
    space: CGColorSpace(name: CGColorSpace.sRGB)!,
    bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue
) else {
    print("Contexte de lecture impossible")
    exit(1)
}
readContext.draw(image, in: CGRect(x: 0, y: 0, width: width, height: height))

/* ------------------------------------------------------------------ */
/* Détourage : luminance → alpha, puis dé-prémultiplication            */
/* ------------------------------------------------------------------ */

/// Sur fond noir, la luminance d'un pixel EST son opacité : le blanc et l'or
/// ressortent, le fond disparaît.
func luminance(_ r: Int, _ g: Int, _ b: Int) -> Double {
    Double(max(r, max(g, b))) / 255.0
}

func alphaFor(_ level: Double) -> Double {
    if level <= floorLevel { return 0 }
    if level >= ceilLevel { return 1 }
    let t = (level - floorLevel) / (ceilLevel - floorLevel)
    // Lissage : un simple linéaire laisse un bord dur sur le filet tricolore.
    return t * t * (3 - 2 * t)
}

var straight = [UInt8](repeating: 0, count: width * height * 4)

for index in 0..<(width * height) {
    let offset = index * 4
    let r = Int(pixels[offset])
    let g = Int(pixels[offset + 1])
    let b = Int(pixels[offset + 2])
    let alpha = alphaFor(luminance(r, g, b))

    if alpha <= 0 { continue }

    // Dé-prémultiplication : le JPEG est opaque, mais les bords que l'on rend
    // translucides doivent retrouver leur couleur pleine, sinon ils virent au
    // gris (le noir du fond reste mélangé dedans).
    func restore(_ channel: Int) -> UInt8 {
        guard alpha < 1 else { return UInt8(channel) }
        return UInt8(max(0, min(255, Int((Double(channel) / alpha).rounded()))))
    }

    straight[offset] = restore(r)
    straight[offset + 1] = restore(g)
    straight[offset + 2] = restore(b)
    straight[offset + 3] = UInt8((alpha * 255).rounded())
}

/* ------------------------------------------------------------------ */
/* Rognage sur le contenu, avec une petite marge optique               */
/* ------------------------------------------------------------------ */

var minX = width, minY = height, maxX = -1, maxY = -1
for y in 0..<height {
    for x in 0..<width where straight[(y * width + x) * 4 + 3] > 8 {
        if x < minX { minX = x }
        if x > maxX { maxX = x }
        if y < minY { minY = y }
        if y > maxY { maxY = y }
    }
}

guard maxX >= minX, maxY >= minY else {
    print("Image vide après détourage")
    exit(1)
}

let pad = max(2, Int((Double(maxX - minX + 1) * 0.004).rounded()))
minX = max(0, minX - pad); minY = max(0, minY - pad)
maxX = min(width - 1, maxX + pad); maxY = min(height - 1, maxY + pad)

let trimW = maxX - minX + 1
let trimH = maxY - minY + 1
var trimmed = [UInt8](repeating: 0, count: trimW * trimH * 4)
for y in 0..<trimH {
    for x in 0..<trimW {
        let from = ((minY + y) * width + (minX + x)) * 4
        let to = (y * trimW + x) * 4
        trimmed[to] = straight[from]
        trimmed[to + 1] = straight[from + 1]
        trimmed[to + 2] = straight[from + 2]
        trimmed[to + 3] = straight[from + 3]
    }
}

/// Construit une image depuis des pixels à alpha **non prémultiplié** :
/// l'encodeur PNG les écrit tels quels, sans repasser par une division.
func makeImage(_ buffer: [UInt8], _ w: Int, _ h: Int) -> CGImage? {
    guard let provider = CGDataProvider(data: Data(buffer) as CFData) else { return nil }
    return CGImage(
        width: w,
        height: h,
        bitsPerComponent: 8,
        bitsPerPixel: 32,
        bytesPerRow: w * 4,
        space: CGColorSpace(name: CGColorSpace.sRGB)!,
        bitmapInfo: CGBitmapInfo(rawValue: CGImageAlphaInfo.last.rawValue),
        provider: provider,
        decode: nil,
        shouldInterpolate: true,
        intent: .defaultIntent
    )
}

func writePNG(_ image: CGImage, to path: String) {
    let url = URL(fileURLWithPath: path)
    try? FileManager.default.createDirectory(
        at: url.deletingLastPathComponent(),
        withIntermediateDirectories: true
    )
    guard let destination = CGImageDestinationCreateWithURL(
        url as CFURL,
        UTType.png.identifier as CFString,
        1,
        nil
    ) else {
        print("Écriture impossible : \(path)")
        exit(1)
    }
    CGImageDestinationAddImage(destination, image, nil)
    guard CGImageDestinationFinalize(destination) else {
        print("Écriture impossible : \(path)")
        exit(1)
    }
}

guard let lockup = makeImage(trimmed, trimW, trimH) else {
    print("Image de marque impossible à construire")
    exit(1)
}
writePNG(lockup, to: logoOut)
print("→ \(logoOut)  \(trimW)×\(trimH)  (source \(width)×\(height))")

/* ------------------------------------------------------------------ */
/* Favicons : la marque complète posée sur le vert de marque           */
/* ------------------------------------------------------------------ */

/// Dessine la marque centrée dans une tuile carrée, sur le vert de marque.
/// La marque garde son ratio : elle est ajustée en largeur, jamais déformée.
func tile(size: Int) -> CGImage? {
    guard let context = CGContext(
        data: nil,
        width: size,
        height: size,
        bitsPerComponent: 8,
        bytesPerRow: 0,
        space: CGColorSpace(name: CGColorSpace.sRGB)!,
        bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue
    ) else { return nil }

    context.setFillColor(
        red: CGFloat(brandGreen.r) / 255,
        green: CGFloat(brandGreen.g) / 255,
        blue: CGFloat(brandGreen.b) / 255,
        alpha: 1
    )
    context.fill(CGRect(x: 0, y: 0, width: size, height: size))

    let inset = CGFloat(size) * 0.08
    let available = CGFloat(size) - inset * 2
    let scale = available / CGFloat(trimW)
    let drawW = available
    let drawH = CGFloat(trimH) * scale
    let rect = CGRect(
        x: inset,
        y: (CGFloat(size) - drawH) / 2,
        width: drawW,
        height: drawH
    )
    context.interpolationQuality = .high
    context.draw(lockup, in: rect)
    return context.makeImage()
}

struct IconSpec {
    let size: Int
    let path: String
}

let pngIcons = [
    IconSpec(size: 192, path: "\(outDir)/favicon.png"),
    IconSpec(size: 180, path: "\(outDir)/apple-touch-icon.png"),
]

for spec in pngIcons {
    guard let image = tile(size: spec.size) else { continue }
    writePNG(image, to: spec.path)
    print("→ \(spec.path)  \(spec.size)×\(spec.size)")
}

/// ICO : un répertoire de PNG, format accepté par tous les navigateurs.
/// Les tuiles sont ré-encodées en PNG pour être insérées telles quelles.
func pngData(_ image: CGImage) -> Data? {
    let data = NSMutableData()
    guard let destination = CGImageDestinationCreateWithData(
        data,
        UTType.png.identifier as CFString,
        1,
        nil
    ) else { return nil }
    CGImageDestinationAddImage(destination, image, nil)
    guard CGImageDestinationFinalize(destination) else { return nil }
    return data as Data
}

let icoSizes = [16, 32, 48]
let encoded = icoSizes.compactMap { size -> (Int, Data)? in
    guard let image = tile(size: size), let data = pngData(image) else { return nil }
    return (size, data)
}

if encoded.count == icoSizes.count {
    var ico = Data()
    func appendUInt16(_ value: UInt16) {
        ico.append(UInt8(value & 0xff))
        ico.append(UInt8((value >> 8) & 0xff))
    }
    func appendUInt32(_ value: UInt32) {
        appendUInt16(UInt16(value & 0xffff))
        appendUInt16(UInt16((value >> 16) & 0xffff))
    }

    let headerSize = 6 + encoded.count * 16
    appendUInt16(0)                            // réservé
    appendUInt16(1)                            // type : icône
    appendUInt16(UInt16(encoded.count))        // nombre d'images
    var offset = UInt32(headerSize)
    for (size, data) in encoded {
        ico.append(UInt8(size == 256 ? 0 : size))  // largeur (0 = 256)
        ico.append(UInt8(size == 256 ? 0 : size))
        ico.append(0)                              // couleurs de la palette
        ico.append(0)                              // réservé
        appendUInt16(1)                            // plans
        appendUInt16(32)                           // bits par pixel
        appendUInt32(UInt32(data.count))
        appendUInt32(offset)
        offset += UInt32(data.count)
    }
    for (_, data) in encoded { ico.append(data) }

    let icoPath = "\(outDir)/favicon.ico"
    try? ico.write(to: URL(fileURLWithPath: icoPath))
    print("→ \(icoPath)  \(icoSizes.map(String.init).joined(separator: " / "))")
} else {
    print("Favicon ICO non généré : encodage PNG incomplet")
    exit(1)
}

print("Marque régénérée depuis \(sourcePath) — penser à relancer les visuels qui l'intègrent :")
print("  swift scripts/make-og-image.swift …   (4 cartes de partage)")
print("  npm run brochure && npm run brochure:previews   (plaquette + aperçus)")
