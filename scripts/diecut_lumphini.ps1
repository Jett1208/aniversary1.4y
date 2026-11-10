$csharp = @"
using System;
using System.Drawing;
using System.Drawing.Imaging;
using System.Collections.Generic;
using System.Runtime.InteropServices;

public class ImageDieCutterLumphini
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

$srcDir = "asset(props)\สวนลุมพินี"
$outFolder = "public\images\ch4-lumphini\props"

if (-not (Test-Path $outFolder)) {
    New-Item -ItemType Directory -Path $outFolder -Force | Out-Null
}

$filesToProcess = @(
    @{ Src = "เรือเป็ด.png";   Out = "duck-boat.png";       Thresh = 242; Flood = $true },
    @{ Src = "น้ำ.png";        Out = "water.png";           Thresh = 244; Flood = $true },
    @{ Src = "ร.png";          Out = "rose-bouquet.png";    Thresh = 242; Flood = $true },
    @{ Src = "prop (5).png";   Out = "bush.png";            Thresh = 242; Flood = $true },
    @{ Src = "ร (1).png";      Out = "skyline-classic.png"; Thresh = 240; Flood = $true },
    @{ Src = "ร (2).png";      Out = "skyline-modern.png";  Thresh = 240; Flood = $true },
    @{ Src = "ร (3).png";      Out = "flower-bed.png";      Thresh = 240; Flood = $true },
    @{ Src = "ร (4).png";      Out = "balloons.png";        Thresh = 240; Flood = $true },
    @{ Src = "ร (5).png";      Out = "ribbon.png";          Thresh = 240; Flood = $true },
    @{ Src = "ร (6).png";      Out = "heart.png";           Thresh = 244; Flood = $true },
    @{ Src = "ร (7).png";      Out = "valentine.png";       Thresh = 242; Flood = $true },
    @{ Src = "เมฆ (1).png";    Out = "cloud-teal.png";      Thresh = 246; Flood = $true },
    @{ Src = "เมฆ (2).png";    Out = "cloud-blue.png";      Thresh = 246; Flood = $true },
    @{ Src = "เมฆ (3).png";    Out = "cloud-warm.png";      Thresh = 246; Flood = $true }
)

foreach ($item in $filesToProcess) {
    $srcPath = Join-Path $srcDir $item.Src
    $destPath = Join-Path $outFolder $item.Out
    if (Test-Path -LiteralPath $srcPath) {
        Write-Output "Processing $($item.Src) -> $($item.Out)..."
        [ImageDieCutterLumphini]::ProcessImage($srcPath, $destPath, $item.Thresh, $item.Flood)
    } else {
        Write-Warning "File not found: $srcPath"
    }
}

Write-Output "All Lumphini props processed successfully!"
