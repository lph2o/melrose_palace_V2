// Génère les avatars des témoignages à partir des photos réelles des clients.
//
// Sortie : `public/images/avatar-<n>.jpg`, carrés, cadrés sur le visage. Ces
// fichiers sont la source versionnée des objets `images/avatar-<n>.jpg` du
// bucket Supabase — c'est `scripts/upload-media.cjs` qui les téléverse.
//
// Usage — à COMPILER avant de lancer : l'interpréteur `swift` ne résout pas
// `CGContext.draw(_:in:)` (erreur « JIT session error: Symbols not found »).
//
//   swiftc -O scripts/make-avatar-assets.swift -o /tmp/make-avatar
//   /tmp/make-avatar --photo <photo.png> --out public/images/avatar-1.jpg --crop x,y,w,h
//
// Les trois commandes correspondant aux témoignages en ligne. Les photos
// sources sont celles fournies par le gérant ; elles ne sont PAS versionnées
// (portraits de clients, données personnelles) et vivent hors du dépôt. Il faut
// donc les redemander avant de rejouer ces commandes — mais les cadrages,
// eux, sont figés ici, et c'est le seul choix à ne pas perdre :
//
//   # avatar-1 — Dr. Mamadou Ndiaye
//   /tmp/make-avatar --photo <photo1> --out public/images/avatar-1.jpg --crop 0,0,288,288
//   # avatar-2 — Aïssatou Ba
//   /tmp/make-avatar --photo <photo2> --out public/images/avatar-2.jpg --crop 94,0,112,112
//   # avatar-3 — Ousmane Diop
//   /tmp/make-avatar --photo <photo3> --out public/images/avatar-3.jpg --crop 55,0,180,180
//
// Les trois cadrages partent de y = 0 : sur chaque source, le haut du crâne
// touche déjà le bord de l'image, il n'y a pas de marge à récupérer au-dessus.
//
// POURQUOI LE CADRAGE EST EXPLICITE. L'avatar est affiché en cercle de 40 px
// (`TestimonialsSection.tsx`). Une photo de client est presque toujours un
// portrait vertical où la tête occupe le tiers supérieur : posée telle quelle
// dans un cercle, `object-cover` en garde la bande centrale et coupe le crâne —
// c'est ce qui rendait les anciens avatars (200 × 300) méconnaissables.
//
// Le cadrage automatique a été essayé et écarté sur pièces. `--auto` reste
// disponible, mais il ne faut pas s'y fier :
//   - sur une photo, Vision place les « pupilles » sur un foulard, au-dessus
//     des yeux ;
//   - sur une autre, sa boîte de visage mesure 291 px dans une image large de
//     288 (confiance 0,66), et le carré calculé dépasse alors l'image — donc
//     aucun cadrage du tout ;
//   - sur une troisième (lunettes larges), les repères se posent sur les
//     verres.
// Trois photos, trois échecs différents : la détection n'est pas une base de
// décision ici. Les cadrages du bloc d'usage ci-dessus ont été choisis à l'œil,
// en comparant les rendus circulaires de 40 à 160 px, puis vérifiés dans la
// carte de témoignage. C'est reproductible, mais cela reste un choix humain :
// si le gérant remplace une photo, il faut refaire ce choix.
//
// L'unité de comparaison retenue entre les trois portraits est la part du
// cercle occupée par le visage. Les sources n'ont pas le même cadrage — l'une
// est un gros plan, une autre un plan large — donc un même côté de carré donne
// des têtes de tailles très différentes. Sur les trois retenues, le visage
// occupe environ un tiers du carré.
//
// Note : le côté du carré est plafonné par la largeur de l'image. Sur la photo
// en gros plan, 288 px est le maximum possible ; c'est ce qui fixe l'échelle
// des deux autres pour rester cohérent.

import Foundation
import CoreGraphics
import ImageIO
import UniformTypeIdentifiers
import Vision

/* ------------------------------------------------------------------ */
/* Arguments                                                           */
/* ------------------------------------------------------------------ */

func argValue(_ name: String, default fallback: String) -> String {
    let args = CommandLine.arguments
    guard let index = args.firstIndex(of: name), index + 1 < args.count else { return fallback }
    return args[index + 1]
}

func argDouble(_ name: String, default fallback: Double) -> Double {
    guard let value = Double(argValue(name, default: "")), value.isFinite else { return fallback }
    return value
}

/// « x,y,w,h » en pixels de l'image source.
func argRect(_ name: String) -> CGRect? {
    let parts = argValue(name, default: "").split(separator: ",").compactMap { Double($0) }
    guard parts.count == 4 else { return nil }
    return CGRect(x: parts[0], y: parts[1], width: parts[2], height: parts[3])
}

let photoPath = argValue("--photo", default: "")
let outPath = argValue("--out", default: "")
let explicitCrop = argRect("--crop")
let auto = CommandLine.arguments.contains("--auto")
let side = Int(argDouble("--size", default: 256))
let eyesFactor = argDouble("--eyes", default: 4.0)
let anchor = argDouble("--anchor", default: 0.40)
let fallbackHeads = argDouble("--fallback-heads", default: 2.6)
let quality = argDouble("--quality", default: 0.88)

if photoPath.isEmpty || outPath.isEmpty || (explicitCrop == nil && !auto) {
    print("""
    Usage : make-avatar --photo <source> --out <destination.jpg> --crop x,y,w,h
            make-avatar --photo <source> --out <destination.jpg> --auto   (à vérifier à l'œil)
    """)
    exit(1)
}

/* ------------------------------------------------------------------ */
/* Chargement                                                          */
/* ------------------------------------------------------------------ */

guard let source = CGImageSourceCreateWithURL(URL(fileURLWithPath: photoPath) as CFURL, nil),
      let image = CGImageSourceCreateImageAtIndex(source, 0, nil) else {
    print("Impossible d'ouvrir l'image : \(photoPath)")
    exit(1)
}

let width = image.width
let height = image.height

/* ------------------------------------------------------------------ */
/* Cadrage                                                             */
/* ------------------------------------------------------------------ */

/// Ramène le carré dans l'image. Un cadrage qui déborde est ramené sur les
/// bords plutôt que réduit : mieux vaut un carré légèrement décentré qu'une
/// tête rétrécie. Si l'image est plus petite que le carré, elle est prise en
/// entier — jamais étirée.
func clamped(_ rect: CGRect) -> CGRect {
    var r = rect
    if r.width > CGFloat(width) { r.origin.x = 0; r.size.width = CGFloat(width) }
    if r.height > CGFloat(height) { r.origin.y = 0; r.size.height = CGFloat(height) }
    if r.minX < 0 { r.origin.x = 0 }
    if r.minY < 0 { r.origin.y = 0 }
    if r.maxX > CGFloat(width) { r.origin.x = CGFloat(width) - r.width }
    if r.maxY > CGFloat(height) { r.origin.y = CGFloat(height) - r.height }
    guard r.origin.x.isFinite, r.origin.y.isFinite else {
        return CGRect(x: 0, y: 0, width: width, height: height)
    }
    return r
}

/// Vision raisonne en coordonnées normalisées, origine en bas à gauche.
/// On repasse en pixels, origine en haut à gauche.
func pixelRect(_ box: CGRect) -> CGRect {
    CGRect(
        x: box.minX * CGFloat(width),
        y: (1 - box.maxY) * CGFloat(height),
        width: box.width * CGFloat(width),
        height: box.height * CGFloat(height)
    )
}

/// Centre d'une région de repère (œil), en pixels image.
/// Les points d'une région sont exprimés dans la boîte du visage, pas dans
/// l'image : il faut composer les deux transformations.
func centroid(of region: VNFaceLandmarkRegion2D?, in box: CGRect) -> CGPoint? {
    let points = region?.normalizedPoints ?? []
    guard !points.isEmpty else { return nil }
    let sx = points.reduce(0) { $0 + CGFloat($1.x) } / CGFloat(points.count)
    let sy = points.reduce(0) { $0 + CGFloat($1.y) } / CGFloat(points.count)
    return CGPoint(
        x: (box.minX + sx * box.width) * CGFloat(width),
        y: (1 - (box.minY + sy * box.height)) * CGFloat(height)
    )
}

/// Cadrage automatique : les yeux quand ils sont lisibles, la boîte sinon.
/// Les pupilles sont préférées aux paupières — un seul point par œil, donc
/// aucun biais dû à la forme de l'œil.
func autoCrop() -> CGRect? {
    let request = VNDetectFaceLandmarksRequest()
    do {
        try VNImageRequestHandler(cgImage: image, options: [:]).perform([request])
    } catch {
        print("Détection impossible : \(error.localizedDescription)")
        return nil
    }
    let faces = request.results ?? []

    // Visage le plus grand = le sujet. Un figurant en arrière-plan donnerait
    // sinon le cadrage.
    guard let face = faces.max(by: {
        $0.boundingBox.width * $0.boundingBox.height < $1.boundingBox.width * $1.boundingBox.height
    }) else { return nil }

    let box = face.boundingBox
    let landmarks = face.landmarks
    let left = centroid(of: landmarks?.leftPupil, in: box) ?? centroid(of: landmarks?.leftEye, in: box)
    let right = centroid(of: landmarks?.rightPupil, in: box) ?? centroid(of: landmarks?.rightEye, in: box)

    if let l = left, let r = right {
        let distance = hypot(r.x - l.x, r.y - l.y)
        if distance > 2 {
            let centre = CGPoint(x: (l.x + r.x) / 2, y: (l.y + r.y) / 2)
            let extent = distance * CGFloat(eyesFactor)
            print("  écart des yeux \(Int(distance)) px · cadrage automatique — À VÉRIFIER À L'ŒIL")
            return clamped(CGRect(x: centre.x - extent / 2, y: centre.y - extent * CGFloat(anchor), width: extent, height: extent))
        }
    }

    print("  yeux non détectés — repli sur la boîte du visage — À VÉRIFIER À L'ŒIL")
    let pixel = pixelRect(box)
    let extent = pixel.height * CGFloat(fallbackHeads)
    let centre = CGPoint(x: pixel.midX, y: pixel.minY + pixel.height * 0.35)
    return clamped(CGRect(x: centre.x - extent / 2, y: centre.y - extent * CGFloat(anchor), width: extent, height: extent))
}

let crop: CGRect
if let explicitCrop {
    crop = clamped(explicitCrop)
    if crop != explicitCrop {
        print("  cadrage ramené dans l'image : \(Int(explicitCrop.minX)),\(Int(explicitCrop.minY)) \(Int(explicitCrop.width))×\(Int(explicitCrop.height)) → \(Int(crop.minX)),\(Int(crop.minY)) \(Int(crop.width))×\(Int(crop.height))")
    }
} else {
    guard let auto = autoCrop() else {
        print("Aucun visage détecté dans \(photoPath). Fournir un cadrage explicite avec --crop.")
        exit(2)
    }
    crop = auto
}

/* ------------------------------------------------------------------ */
/* Rendu                                                               */
/* ------------------------------------------------------------------ */

guard let cropped = image.cropping(to: crop) else {
    print("Recadrage impossible (\(crop)).")
    exit(1)
}

let sidePx = max(16, side)
guard let context = CGContext(
    data: nil,
    width: sidePx,
    height: sidePx,
    bitsPerComponent: 8,
    bytesPerRow: 0,
    space: CGColorSpace(name: CGColorSpace.sRGB)!,
    bitmapInfo: CGImageAlphaInfo.noneSkipLast.rawValue
) else {
    print("Contexte de dessin indisponible.")
    exit(1)
}

// Ré-échantillonnage de qualité : une photo de client est presque toujours
// agrandie ou réduite d'un facteur notable, et perdre les traits du visage
// rendrait l'avatar inutile.
context.interpolationQuality = .high
context.draw(cropped, in: CGRect(x: 0, y: 0, width: sidePx, height: sidePx))

guard let output = context.makeImage() else {
    print("Rendu impossible.")
    exit(1)
}

let outURL = URL(fileURLWithPath: outPath)
try? FileManager.default.createDirectory(at: outURL.deletingLastPathComponent(), withIntermediateDirectories: true)

guard let destination = CGImageDestinationCreateWithURL(outURL as CFURL, UTType.jpeg.identifier as CFString, 1, nil) else {
    print("Écriture impossible : \(outPath)")
    exit(1)
}
CGImageDestinationAddImage(destination, output, [kCGImageDestinationLossyCompressionQuality: quality] as CFDictionary)
guard CGImageDestinationFinalize(destination) else {
    print("Finalisation impossible : \(outPath)")
    exit(1)
}

let bytes = ((try? FileManager.default.attributesOfItem(atPath: outPath))?[.size] as? Int) ?? 0
print("✓ \(outPath) — \(sidePx)×\(sidePx), \(bytes / 1024) Ko")
print("  source \(width)×\(height) · cadrage \(Int(crop.minX)),\(Int(crop.minY)) côté \(Int(crop.width))")
