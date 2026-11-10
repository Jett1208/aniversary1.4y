Add-Type -AssemblyName System.Drawing
$dirs = Get-ChildItem -LiteralPath "asset(props)" -Directory
$taladnoi = $dirs[1]
Get-ChildItem -LiteralPath $taladnoi.FullName -File | ForEach-Object {
    $img = [System.Drawing.Bitmap]::FromFile($_.FullName)
    $c00 = $img.GetPixel(0, 0)
    $cTopRight = $img.GetPixel($img.Width - 1, 0)
    $cBotLeft = $img.GetPixel(0, $img.Height - 1)
    $img.Dispose()
    [PSCustomObject]@{
        Name = $_.Name
        TopLeft = "R=$($c00.R),G=$($c00.G),B=$($c00.B)"
        TopRight = "R=$($cTopRight.R),G=$($cTopRight.G),B=$($cTopRight.B)"
        BotLeft = "R=$($cBotLeft.R),G=$($cBotLeft.G),B=$($cBotLeft.B)"
    }
} | Format-Table -AutoSize
