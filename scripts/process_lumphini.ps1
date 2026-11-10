$csharp = @"
using System;
using System.Drawing;
using System.Drawing.Imaging;
using System.Collections.Generic;
using System.Runtime.InteropServices;

public class ImageDieCutterLumphiniClean
{
    public static void ProcessImage(string inputPath, string outputPath, int threshold, bool floodFillOnly)
    {
        using (Bitmap src = new Bitmap(inputPath))
        {
            int w = src.Width;
            int h = src.Height;
            using (Bitmap dest = new Bitmap(w, h, PixelFormat.Format32bppArgb))
            {
                BitmapData srcData = src.LockBits(new Rectangle(0, 0, w, h), ImageLockMode.ReadOnly, PixelFormat.Format32bppArgb);
                BitmapData destData = dest.LockBits(new Rectangle(0, 0, w, h), ImageLockMode.WriteOnly, PixelFormat.Format32bppArgb);

                int bytes = Math.Abs(srcData.Stride) * h;
                byte[] srcRgba = new byte[bytes];
                byte[] destRgba = new byte[bytes];

                Marshal.Copy(srcData.Scan0, srcRgba, 0, bytes);

                int stride = srcData.Stride;
                bool[,] isBg = new bool[w, h];

                if (floodFillOnly)
                {
                    Queue<Point> q = new Queue<Point>();
                    for (int x = 0; x < w; x++)
                    {
                        q.Enqueue(new Point(x, 0));
                        q.Enqueue(new Point(x, h - 1));
                    }
                    for (int y = 0; y < h; y++)
                    {
                        q.Enqueue(new Point(0, y));
                        q.Enqueue(new Point(w - 1, y));
                    }

                    while (q.Count > 0)
                    {
                        Point p = q.Dequeue();
                        int x = p.X;
                        int y = p.Y;

                        if (x < 0 || x >= w || y < 0 || y >= h) continue;
                        if (isBg[x, y]) continue;

                        int idx = y * stride + x * 4;
                        byte b = srcRgba[idx];
                        byte g = srcRgba[idx + 1];
                        byte r = srcRgba[idx + 2];

                        if (r >= threshold && g >= threshold && b >= threshold)
                        {
                            isBg[x, y] = true;
                            q.Enqueue(new Point(x + 1, y));
                            q.Enqueue(new Point(x - 1, y));
                            q.Enqueue(new Point(x, y + 1));
                            q.Enqueue(new Point(x, y - 1));
                        }
                    }
                }

                for (int y = 0; y < h; y++)
                {
                    for (int x = 0; x < w; x++)
                    {
                        int idx = y * stride + x * 4;
                        byte b = srcRgba[idx];
                        byte g = srcRgba[idx + 1];
                        byte r = srcRgba[idx + 2];

                        if (isBg[x, y])
                        {
                            destRgba[idx] = 0;
                            destRgba[idx + 1] = 0;
                            destRgba[idx + 2] = 0;
                            destRgba[idx + 3] = 0;
                        }
                        else
                        {
                            destRgba[idx] = b;
                            destRgba[idx + 1] = g;
                            destRgba[idx + 2] = r;
                            destRgba[idx + 3] = 255;
                        }
                    }
                }

                Marshal.Copy(destRgba, 0, destData.Scan0, bytes);

                src.UnlockBits(srcData);
                dest.UnlockBits(destData);

                dest.Save(outputPath, ImageFormat.Png);
            }
        }
    }
}
"@

Add-Type -TypeDefinition $csharp -ReferencedAssemblies System.Drawing

$dirs = Get-ChildItem -LiteralPath "asset(props)" -Directory
$lumphiniDir = $dirs[5]
$outFolder = "public\images\ch4-lumphini\props"
if (-not (Test-Path $outFolder)) {
    New-Item -ItemType Directory -Force -Path $outFolder | Out-Null
}

Get-ChildItem -LiteralPath $lumphiniDir.FullName -File | ForEach-Object {
    $img = [System.Drawing.Image]::FromFile($_.FullName)
    $w = $img.Width
    $h = $img.Height
    $img.Dispose()

    $fn = $_.Name
    $targetName = $null
    $threshold = 242

    if ($w -eq 674 -and $h -eq 864) {
        $targetName = "duck-boat.png"
    }
    elseif ($w -eq 1704 -and $h -eq 375) {
        $targetName = "water.png"
        $threshold = 244
    }
    elseif ($w -eq 795 -and $h -eq 864) {
        $targetName = "rose-bouquet.png"
    }
    elseif ($w -eq 573 -and $h -eq 432) {
        $targetName = "bush.png"
    }
    elseif ($w -eq 839 -and $h -eq 864) {
        $targetName = "skyline-classic.png"
        $threshold = 240
    }
    elseif ($w -eq 869 -and $h -eq 864) {
        $targetName = "skyline-modern.png"
        $threshold = 240
    }
    elseif ($w -eq 253 -and $h -eq 432) {
        $targetName = "balloons.png"
        $threshold = 240
    }
    elseif ($w -eq 645 -and $h -eq 432) {
        $targetName = "ribbon.png"
        $threshold = 240
    }
    elseif ($w -eq 873 -and $h -eq 864) {
        $targetName = "heart.png"
        $threshold = 244
    }
    elseif ($w -eq 1372 -and $h -eq 864) {
        $targetName = "valentine.png"
    }
    elseif ($w -eq 1417 -and $h -eq 864) {
        $targetName = "cloud-teal.png"
        $threshold = 246
    }
    elseif ($w -eq 1704 -and $h -eq 767) {
        $targetName = "cloud-warm.png"
        $threshold = 246
    }
    elseif ($w -eq 1704 -and $h -eq 835) {
        # Could be flower-bed (ร (3).png, 2.3MB) or cloud-blue (เมฆ (2).png, 854KB)
        if ($_.Length -gt 1500000) {
            $targetName = "flower-bed.png"
            $threshold = 240
        } else {
            $targetName = "cloud-blue.png"
            $threshold = 246
        }
    }

    if ($targetName) {
        $dest = Join-Path $outFolder $targetName
        Write-Host ("Processing {0} ({1}x{2}) -> {3}" -f $fn, $w, $h, $targetName)
        [ImageDieCutterLumphiniClean]::ProcessImage($_.FullName, $dest, $threshold, $true)
    } else {
        Write-Warning ("Unrecognized file: {0} ({1}x{2})" -f $fn, $w, $h)
    }
}

Write-Host "Done processing Lumphini assets!"
