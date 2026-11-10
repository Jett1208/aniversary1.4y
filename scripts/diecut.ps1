$csharp = @"
using System;
using System.Drawing;
using System.Drawing.Imaging;
using System.Collections.Generic;
using System.Runtime.InteropServices;

public class ImageDieCutter
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

                        // White background detection
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
                            destRgba[idx + 3] = 0; // Completely transparent
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

$rawItems = Get-ChildItem -Path "asset(props)\*" -Include "*.png" -Recurse
$outFolder = (Resolve-Path "public\images\ch1-kohkret\props").Path

foreach ($item in $rawItems) {
    if ($item.Name -like "*boat*") {
        Write-Host "Die-cutting boat: $($item.FullName)"
        [ImageDieCutter]::ProcessImage($item.FullName, "$outFolder\boat.png", 246, $true)
    }
    elseif ($item.Name -like "*kohkret*") {
        Write-Host "Die-cutting kohkret: $($item.FullName)"
        [ImageDieCutter]::ProcessImage($item.FullName, "$outFolder\kohkret.png", 245, $true)
    }
    elseif ($item.Name -like "*prop*") {
        Write-Host "Die-cutting pottery: $($item.FullName)"
        [ImageDieCutter]::ProcessImage($item.FullName, "$outFolder\pottery.png", 242, $false)
    }
    else {
        # Bicycle file
        Write-Host "Die-cutting bicycle: $($item.FullName)"
        [ImageDieCutter]::ProcessImage($item.FullName, "$outFolder\bicycle.png", 242, $false)
    }
}

Write-Host "Done die-cutting all images!"
