Add-Type -AssemblyName System.Drawing
$dirs = Get-ChildItem -LiteralPath "asset(props)" -Directory
$songwat = $dirs[2]
Get-ChildItem -LiteralPath $songwat.FullName -File | ForEach-Object {
    $img = [System.Drawing.Bitmap]::FromFile($_.FullName)
    $c00 = $img.GetPixel(0, 0)
    $cTopRight = $img.GetPixel($img.Width - 1, 0)
    $cBotLeft = $img.GetPixel(0, $img.Height - 1)
    $cCenter = $img.GetPixel([int]($img.Width / 2), [int]($img.Height / 2))
    $img.Dispose()
    [PSCustomObject]@{
        Name = $_.Name
        TopLeft = "R=$($c00.R),G=$($c00.G),B=$($c00.B),A=$($c00.A)"
        TopRight = "R=$($cTopRight.R),G=$($cTopRight.G),B=$($cTopRight.B)"
        Center = "R=$($cCenter.R),G=$($cCenter.G),B=$($cCenter.B)"
    }
} | Format-Table -AutoSize
