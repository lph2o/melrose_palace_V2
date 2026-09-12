// Rasterise chaque page d'un PDF en JPEG, sans dépendance externe
// (CoreGraphics/ImageIO, fournis par macOS).
//
// Utilisé pour générer les pages du lecteur de plaquette intégré
// (public/pdf/plaquette/page-N.jpg) : un `<iframe>` PDF reste vide sur iOS et
// dans de nombreux WebView, alors que des images s'affichent partout.
//
// Usage :
//   swift scripts/pdf-to-jpg.swift <fichier.pdf> <dossier-sortie> [largeur]
//
// Exemple :
//   swift scripts/pdf-to-jpg.swift \
//     public/pdf/Dun-Tni-Brochure-Premium.pdf \
//     public/pdf/plaquette 1100

import Foundation
import CoreGraphics
import ImageIO
import UniformTypeIdentifiers

let args = CommandLine.arguments
guard args.count >= 3 else {
    print("usage: swift pdf-to-jpg.swift <fichier.pdf> <dossier-sortie> [largeur=1100]")
    exit(2)
}

let source = URL(fileURLWithPath: args[1])
let outputDir = URL(fileURLWithPath: args[2])
let targetWidth = CGFloat(Double(args.count > 3 ? args[3] : "1100") ?? 1100)

try? FileManager.default.createDirectory(at: outputDir, withIntermediateDirectories: true)

guard let provider = CGDataProvider(url: source as CFURL),
      let document = CGPDFDocument(provider) else {
    print("Impossible d'ouvrir le PDF : \(source.path)")
    exit(1)
}

for index in 1...document.numberOfPages {
    guard let page = document.page(at: index) else { continue }
    let box = page.getBoxRect(.mediaBox)
    let scale = targetWidth / box.width
    let width = Int((box.width * scale).rounded())
    let height = Int((box.height * scale).rounded())

    guard let context = CGContext(
        data: nil,
        width: width,
        height: height,
        bitsPerComponent: 8,
        bytesPerRow: 0,
        space: CGColorSpaceCreateDeviceRGB(),
        bitmapInfo: CGImageAlphaInfo.noneSkipFirst.rawValue
    ) else { continue }

    // Fond blanc : une page PDF transparente deviendrait noire en JPEG.
    context.setFillColor(CGColor(red: 1, green: 1, blue: 1, alpha: 1))
    context.fill(CGRect(x: 0, y: 0, width: width, height: height))
    context.scaleBy(x: scale, y: scale)
    context.translateBy(x: -box.origin.x, y: -box.origin.y)
    context.drawPDFPage(page)

    guard let image = context.makeImage() else { continue }
    let destination = outputDir.appendingPathComponent("page-\(index).jpg")
    guard let writer = CGImageDestinationCreateWithURL(
        destination as CFURL,
        UTType.jpeg.identifier as CFString,
        1,
        nil
    ) else { continue }

    CGImageDestinationAddImage(
        writer,
        image,
        [kCGImageDestinationLossyCompressionQuality: 0.72] as CFDictionary
    )
    CGImageDestinationFinalize(writer)
    print("page \(index) → \(destination.lastPathComponent) (\(width)×\(height))")
}

print("\(document.numberOfPages) page(s) générée(s) dans \(outputDir.path)")
