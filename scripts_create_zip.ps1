$zipPath = "D:\CamtechUniversity\ProgrammingYearIII\techtune-healer\techtune-healer.zip"
$sourceDir = "D:\CamtechUniversity\ProgrammingYearIII\techtune-healer"

if (Test-Path $zipPath) {
    Remove-Item $zipPath -Force
}

Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem

$excludeRegex = '(node_modules|\\\.next|\\\.expo|\\\.git|\\\.scannerwork|\\dist|techtune-healer\.zip)'

$allFiles = [System.IO.Directory]::GetFiles($sourceDir, "*.*", [System.IO.SearchOption]::AllDirectories)
$files = $allFiles | Where-Object { $_ -notmatch $excludeRegex }

Write-Host "Found $($files.Count) clean source files to compress..."

$zip = [System.IO.Compression.ZipFile]::Open($zipPath, [System.IO.Compression.ZipArchiveMode]::Create)

foreach ($filePath in $files) {
    $rel = $filePath.Substring($sourceDir.Length + 1).Replace("\", "/")
    [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($zip, $filePath, $rel, [System.IO.Compression.CompressionLevel]::Optimal) | Out-Null
}

$zip.Dispose()

$sizeMB = (Get-Item $zipPath).Length / 1MB
Write-Host "Created $zipPath successfully ($([Math]::Round($sizeMB, 2)) MB, $($files.Count) files)"
