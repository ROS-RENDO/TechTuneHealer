Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem

$rootDir = "D:\CamtechUniversity\ProgrammingYearIII\techtune-healer"
$zipPath = Join-Path $rootDir "techtune-healer.zip"

if (Test-Path $zipPath) {
    Remove-Item $zipPath -Force
}

$excludeDirs = @(
    "node_modules",
    ".git",
    ".next",
    ".expo",
    ".expo-shared",
    ".scannerwork",
    ".agents",
    ".gemini",
    ".vscode",
    ".idea",
    "dist",
    "build"
)

$excludeExtensions = @(".zip", ".log", ".tmp")

Write-Host "Creating clean ZIP archive without node_modules..."
$archive = [System.IO.Compression.ZipFile]::Open($zipPath, [System.IO.Compression.ZipArchiveMode]::Create)

$allFiles = Get-ChildItem -Path $rootDir -Recurse -File -Force

$addedCount = 0
foreach ($file in $allFiles) {
    $fullPath = $file.FullName
    $relPath = $fullPath.Substring($rootDir.Length + 1).Replace('\', '/')
    
    # Check if in excluded directory
    $skip = $false
    foreach ($dir in $excludeDirs) {
        if ($relPath -eq $dir -or $relPath.StartsWith("$dir/") -or $relPath.Contains("/$dir/")) {
            $skip = $true
            break
        }
    }
    
    if ($skip) { continue }
    
    # Check if excluded extension
    $ext = $file.Extension.ToLower()
    if ($excludeExtensions -contains $ext) {
        continue
    }
    
    # Check backend uploads
    if ($relPath.StartsWith("backend/uploads/")) {
        continue
    }

    try {
        [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile(
            $archive,
            $fullPath,
            $relPath,
            [System.IO.Compression.CompressionLevel]::Optimal
        ) | Out-Null
        $addedCount++
    } catch {
        Write-Warning "Could not add: $relPath ($($_.Exception.Message))"
    }
}

$archive.Dispose()

$zipItem = Get-Item $zipPath
$sizeMB = [math]::Round($zipItem.Length / 1MB, 2)
Write-Host "SUCCESS! Clean ZIP created: $($zipItem.Name)"
Write-Host "Total files included: $addedCount"
Write-Host "ZIP Size: $sizeMB MB"
Write-Host "Location: $($zipItem.FullName)"
