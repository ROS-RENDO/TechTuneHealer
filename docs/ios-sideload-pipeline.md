# iOS Physical Device IPA Sideloading Architecture & CI Pattern
**Category**: Mobile DevOps / Cross-Platform Engineering  
**Target Platform**: iOS Physical Devices (iPhone Hardware, ARM64)  
**Host Environment**: Windows 11 PC (Zero macOS hardware required locally)  
**Cost**: $0 (No $99/year Apple Developer Account needed)  
**Verified**: October 2026 (Expo SDK 54, React Native 0.81.5, Xcode 16.4 / macOS 15 Runner)

---

## 1. Executive Summary & Problem Space

When developing React Native / Expo applications from a Windows machine, installing directly to a physical iPhone typically hits major barriers:
1. **Apple Code Signing Wall**: iOS strictly blocks raw unsigned binaries on physical hardware.
2. **EAS Build Restriction**: Automated ad-hoc cloud provisioning through EAS requires a paid Apple Developer Team ID ($99/year). Free personal Apple IDs are blocked from Apple's developer provisioning API.
3. **The Simulator Trap**: Building with EAS `preview-simulator` generates an `.ipa` targeting `iphonesimulator` (`Platform 7`), which physical iPhones refuse to install (`0xe8000087` architecture mismatch).
4. **The Bleeding-Edge Expo SDK Trap**: Unreleased/Canary Expo SDKs (e.g. SDK 57) bundle packages like `expo-modules-jsi` that rely on unreleased Swift 6.2 features (`Task.immediate`, `SWIFT_IMMORTAL_REFERENCE`, C++ constructors). These fail on GitHub Actions Xcode 16.x runners because Xcode only has Swift 6.1.

### The Solution Pattern
- **Host (Windows)**: Use **Sideloadly** over USB with a free personal Apple ID to sign the binary locally at install time.
- **CI Build (GitHub Actions macOS Runner)**: Compile an **unsigned physical device ARM64 binary** (`Platform 2`, `iphoneos`) using `xcodebuild` with `CODE_SIGNING_ALLOWED=NO`.
- **Framework (Expo)**: Lock project to **Expo SDK 54** (or stable 52/53) where native modules build with battle-tested CocoaPods, bypassing experimental Swift 6.2 toolchains.

---

## 2. Binary Architecture Verification: Simulator vs Physical Device

| Attribute | Simulator Build (EAS `preview-simulator`) | Physical Device Build (This CI Pattern) |
| :--- | :--- | :--- |
| **Mach-O CPU Type** | `x86_64` or `arm64-simulator` | `arm64` (`0x0100000c`) |
| **Mach-O Magic** | `0xfeedfacf` (64-bit) | `0xfeedfacf` (64-bit) |
| **`LC_BUILD_VERSION` Platform** | `7` (`PLATFORM_IOSSIMULATOR`) | `2` (`PLATFORM_IOS`) |
| **Sideloadly Outcome** | ❌ **Error `0xe8000087`** (Mismatched arch) | ✅ **Installed & Verified Live** |

### Python Script to Inspect Mach-O Headers inside any `.ipa`:
```python
import zipfile, struct

with zipfile.ZipFile('TechTuneHealer-sideload.ipa', 'r') as z:
    for name in z.namelist():
        if name.endswith('.app/TechTuneHealer'):
            data = z.read(name)
            cputype = struct.unpack('<I', data[4:8])[0]
            print('CPU Type:', 'ARM64' if cputype == 0x0100000C else hex(cputype))
            
            offset = 32
            ncmds = struct.unpack('<I', data[16:20])[0]
            for _ in range(ncmds):
                cmd, cmdsize = struct.unpack('<II', data[offset:offset+8])
                if cmd == 0x32: # LC_BUILD_VERSION
                    platform = struct.unpack('<I', data[offset+8:offset+12])[0]
                    p_name = 'iOS Physical Device' if platform == 2 else ('Simulator' if platform == 7 else str(platform))
                    print(f'Platform ID: {platform} ({p_name})')
                    break
                offset += cmdsize
```

---

## 3. Expo SDK Compatibility Matrix for Headless CI

| Expo SDK Version | React Native | Swift Toolchain Required | GitHub Actions Compatibility | Status |
| :--- | :--- | :--- | :--- | :--- |
| **SDK 54** | `0.81.5` | Swift 5.9 / 6.0 | ✅ 100% Compatible with Xcode 15/16 | **Recommended Standard** |
| **SDK 52 / 53** | `0.76.x` | Swift 5.9 | ✅ 100% Compatible | Stable |
| **SDK 57 (Canary)** | `0.86.x` | Swift 6.2 (Unreleased) | ❌ Fails on Xcode 16.4 (SE-0472 `Task.immediate`) | Do Not Use in CI |

---

## 4. The Complete GitHub Actions Workflow (`build-ios-ipa.yml`)

Located at [`.github/workflows/build-ios-ipa.yml`](file:///d:/CamtechUniversity/ProgrammingYearIII/techtune-healer/.github/workflows/build-ios-ipa.yml).

Key Build Steps:
1. `npm ci --legacy-peer-deps`
2. `npx expo prebuild --platform ios --clean`
3. `cd ios && pod install`
4. Unsigned physical compilation:
   ```bash
   xcodebuild \
     -workspace "$WORKSPACE" \
     -scheme "$SCHEME" \
     -configuration Release \
     -destination "generic/platform=iOS" \
     CODE_SIGNING_ALLOWED=NO \
     CODE_SIGNING_REQUIRED=NO \
     build
   ```
5. Package:
   ```bash
   mkdir -p Payload
   cp -r "$APP_PATH" Payload/
   zip -r TechTuneHealer-sideload.ipa Payload
   ```

---

## 5. Local Backend & Wi-Fi Connectivity Configuration

When testing mobile applications connecting to a backend server running locally on Windows:
1. **Never use `localhost` or `127.0.0.1`**: On a physical iPhone, `localhost` refers to the phone itself.
2. **Use Host LAN IP**: Determine with `ipconfig` (e.g. `192.168.100.171`).
3. **Environment Variable**: Set in `.env`:
   ```bash
   EXPO_PUBLIC_API_URL=http://192.168.100.171:4000
   ```
4. **iOS App Transport Security (Cleartext HTTP)**:
   Add to `app.json` under `expo.ios.infoPlist`:
   ```json
   "NSAppTransportSecurity": {
     "NSAllowsArbitraryLoads": true
   }
   ```
5. **Firewall / Bind Address**: Ensure the backend listens on `0.0.0.0:4000` (not `127.0.0.1:4000`).

---

## 6. Sideloadly Deployment Walkthrough (Windows PC)

1. Connect iPhone to Windows PC via USB cable.
2. Tap **Trust This Computer** on iPhone.
3. Open **Sideloadly**. Confirm the connected device is listed.
4. Drag & drop `TechTuneHealer-sideload.ipa`.
5. Enter personal Apple ID email under **Apple ID**.
6. Click **Start**. Sideloadly signs and installs the app over USB.
7. On iPhone:
   - Navigate to **Settings** > **General** > **VPN & Device Management** > Tap developer account > **Trust**.
   - Navigate to **Settings** > **Privacy & Security** > Scroll down to **Developer Mode** > Toggle **On** (reboots device).
8. App is permanently runnable for 7 days (standard free certificate renewal cycle).
