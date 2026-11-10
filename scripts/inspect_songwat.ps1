Add-Type -AssemblyName System.Drawing
$dirs = Get-ChildItem -LiteralPath "asset(props)" -Directory
$songwat = $dirs[2]
Write-Output "Songwat folder: $($songwat.Name)"
Get-ChildItem -LiteralPath $songwat.FullName -File | ForEach-Object {
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
