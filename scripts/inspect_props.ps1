Add-Type -AssemblyName System.Drawing
$targetDir = (Get-ChildItem -LiteralPath "asset(props)" -Directory | Where-Object { $_.Name -like "*ทรงวาด*" })[0]
Write-Output "Target directory: $($targetDir.FullName)"
Get-ChildItem -LiteralPath $targetDir.FullName -File | ForEach-Object {
    $img = [System.Drawing.Image]::FromFile($_.FullName)
    $obj = [PSCustomObject]@{
        Name = $_.Name
        Width = $img.Width
        Height = $img.Height
        Format = $img.PixelFormat.ToString()
        Ratio = [math]::Round($img.Width / $img.Height, 2)
    }
    $img.Dispose()
    $obj
} | Format-Table -AutoSize
