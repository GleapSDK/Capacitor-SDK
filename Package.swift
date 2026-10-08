// swift-tools-version: 5.9
import PackageDescription

// Swift Package Manager manifest of the plugin's iOS side. `npx cap sync` links it into
// apps that use SPM (ios/App/CapApp-SPM); the package and product name must stay
// "CapacitorGleapPlugin", the name Capacitor derives from the npm package name.
let package = Package(
    name: "CapacitorGleapPlugin",
    platforms: [.iOS(.v15)],
    products: [
        .library(
            name: "CapacitorGleapPlugin",
            targets: ["GleapPlugin"])
    ],
    dependencies: [
        // Capacitor rewrites this to the app's Capacitor major version during `npx cap sync`.
        .package(url: "https://github.com/ionic-team/capacitor-swift-pm.git", from: "7.0.0"),
        // Native Gleap iOS SDK, released together with this plugin (same version).
        .package(url: "https://github.com/GleapSDK/Gleap-iOS-SDK.git", from: "19.2.1")
    ],
    targets: [
        .target(
            name: "GleapPlugin",
            dependencies: [
                .product(name: "Capacitor", package: "capacitor-swift-pm"),
                .product(name: "Cordova", package: "capacitor-swift-pm"),
                .product(name: "Gleap", package: "Gleap-iOS-SDK")
            ],
            path: "ios/Sources/GleapPlugin")
    ]
)
