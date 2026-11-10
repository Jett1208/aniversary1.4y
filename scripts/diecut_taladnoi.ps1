$csharp = @"
using System;
using System.Drawing;
using System.Drawing.Imaging;
using System.Collections.Generic;
using System.Runtime.InteropServices;

public class ImageDieCutterTaladNoi
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
                else
                {
                    for (int y = 0; y < h; y++)
                    {
                        for (int x = 0; x < w; x++)
                        {
                            int idx = y * stride + x * 4;
                            byte b = srcRgba[idx];
                            byte g = srcRgba[idx + 1];
                            byte r = srcRgba[idx + 2];

                            if (r >= threshold && g >= threshold && b >= threshold)
                            {
                                isBg[x, y] = true;
                            }
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
$taladnoiDir = $dirs[1]
$outFolder = "public\images\ch3-taladnoi\props"
if (-not (Test-Path $outFolder)) {
    New-Item -ItemType Directory -Force -Path $outFolder | Out-Null
}

Get-ChildItem -LiteralPath $taladnoiDir.FullName -File | ForEach-Object {
    $img = [System.Drawing.Image]::FromFile($_.FullName)
    $w = $img.Width
    $h = $img.Height
    $img.Dispose()

    # Car: 1490x864
    if ($w -eq 1490 -and $h -eq 864) {
        Write-Output "Processing car (1490x864) -> car.png"
        [ImageDieCutterTaladNoi]::ProcessImage($_.FullName, "$outFolder\car.png", 242, $true)
    }
    # Pixel Tree: 409x432
    elseif ($w -eq 409 -and $h -eq 432) {
        Write-Output "Processing tree (409x432) -> tree.png"
        [ImageDieCutterTaladNoi]::ProcessImage($_.FullName, "$outFolder\tree.png", 242, $true)
    }
    # Controller: 1280x864
    elseif ($w -eq 1280 -and $h -eq 864) {
        Write-Output "Processing controller (1280x864) -> controller.png"
        [ImageDieCutterTaladNoi]::ProcessImage($_.FullName, "$outFolder\controller.png", 244, $true)
    }
    # Pixel Heart: 468x432
    elseif ($w -eq 468 -and $h -eq 432) {
        Write-Output "Processing pixel-heart (468x432) -> pixel-heart.png"
        [ImageDieCutterTaladNoi]::ProcessImage($_.FullName, "$outFolder\pixel-heart.png", 242, $true)
    }
    # Pixel Coin: 432x432
    elseif ($w -eq 432 -and $h -eq 432) {
        Write-Output "Processing coin (432x432) -> coin.png"
        [ImageDieCutterTaladNoi]::ProcessImage($_.FullName, "$outFolder\coin.png", 242, $true)
    }
    # HP Bar: 768x139
    elseif ($w -eq 768 -and $h -eq 139) {
        Write-Output "Processing hp-bar (768x139) -> hp-bar.png"
        [ImageDieCutterTaladNoi]::ProcessImage($_.FullName, "$outFolder\hp-bar.png", 242, $true)
    }
    # Cloud teal: 1417x864
    elseif ($w -eq 1417 -and $h -eq 864) {
        Write-Output "Processing cloud-teal (1417x864) -> cloud-teal.png"
        [ImageDieCutterTaladNoi]::ProcessImage($_.FullName, "$outFolder\cloud-teal.png", 246, $true)
    }
    # Cloud warm: 1704x767
    elseif ($w -eq 1704 -and $h -eq 767) {
        Write-Output "Processing cloud-warm (1704x767) -> cloud-warm.png"
        [ImageDieCutterTaladNoi]::ProcessImage($_.FullName, "$outFolder\cloud-warm.png", 246, $true)
    }
}

Write-Output "All Talad Noi props die-cut successfully!"
