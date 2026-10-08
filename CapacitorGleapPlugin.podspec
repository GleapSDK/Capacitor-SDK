require 'json'

package = JSON.parse(File.read(File.join(__dir__, 'package.json')))

# CocoaPods fallback for apps whose iOS project still uses CocoaPods. Package.swift is the
# primary iOS integration. CocoaPods trunk turns read-only on 2026-12-02: `Gleap` versions
# released after that are not on trunk, so such apps add to their Podfile
#   pod 'Gleap', :git => 'https://github.com/GleapSDK/Gleap-iOS-SDK.git', :tag => 'X.Y.Z'
# which satisfies the dependency below (see README → iOS).
Pod::Spec.new do |s|
  s.name = 'CapacitorGleapPlugin'
  s.version = package['version']
  s.summary = package['description']
  s.license = package['license']
  s.homepage = package['repository']['url']
  s.author = package['author']
  s.source = { :git => package['repository']['url'], :tag => s.version.to_s }
  s.source_files = 'ios/Sources/**/*.{swift,h,m,c,cc,mm,cpp}'
  s.ios.deployment_target = '15.0'
  s.dependency 'Capacitor'
  s.dependency 'Gleap', '19.2.1'
  s.swift_version = '5.1'
end
