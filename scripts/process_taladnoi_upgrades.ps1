$csharp = @"
using System;
using System.Drawing;
using System.Drawing.Imaging;
using System.Collections.Generic;
using System.Runtime.InteropServices;

public class TaladNoiProcessor
{
    // Flood-fill die cut for JPEG/PNG with near-white background
    public static void DieCutBackdrop(string inputPath, string outputPath, int threshold)
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

                Queue<Point> q = new Queue<Point>();
                // Only seed from top, left, and right borders (not bottom, because bottom is ground line)
                for (int x = 0; x < w; x++)
                {
                    q.Enqueue(new Point(x, 0));
                }
                for (int y = 0; y < h - 40; y++)
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

    // Add crisp white paper die-cut sticker outline around a 32bpp ARGB transparent PNG
    public static void AddStickerBorder(string inputPath, string outputPath, int borderWidth)
    {
        using (Bitmap src = new Bitmap(inputPath))
        {
            int w = src.Width;
            int h = src.Height;
            int pad = borderWidth + 4;
            int nw = w + pad * 2;
            int nh = h + pad * 2;

            using (Bitmap dest = new Bitmap(nw, nh, PixelFormat.Format32bppArgb))
            {
                // 1. Extract alpha mask
                bool[,] hasContent = new bool[nw, nh];
                for (int y = 0; y < h; y++)
                {
                    for (int x = 0; x < w; x++)
                    {
                        Color c = src.GetPixel(x, y);
                        if (c.A > 25)
                        {
                            hasContent[x + pad, y + pad] = true;
                        }
                    }
                }

                // 2. Dilate alpha mask to create white sticker outline
                bool[,] stickerMask = new bool[nw, nh];
                for (int y = 0; y < nh; y++)
                {
                    for (int x = 0; x < nw; x++)
                    {
                        if (hasContent[x, y])
                        {
                            for (int dy = -borderWidth; dy <= borderWidth; dy++)
                            {
                                for (int dx = -borderWidth; dx <= borderWidth; dx++)
                                {
                                    if (dx * dx + dy * dy <= borderWidth * borderWidth)
                                    {
                                        int nx = x + dx;
                                        int ny = y + dy;
                                        if (nx >= 0 && nx < nw && ny >= 0 && ny < nh)
                                        {
                                            stickerMask[nx, ny] = true;
                                        }
                                    }
                                }
                            }
                        }
                    }
                }

                // 3. Draw white border into destination
                using (Graphics g = Graphics.FromImage(dest))
                {
                    g.Clear(Color.Transparent);
                    g.InterpolationMode = System.Drawing.Drawing2D.InterpolationMode.NearestNeighbor;
                    g.PixelOffsetMode = System.Drawing.Drawing2D.PixelOffsetMode.Half;

                    for (int y = 0; y < nh; y++)
                    {
                        for (int x = 0; x < nw; x++)
                        {
                            if (stickerMask[x, y])
                            {
                                dest.SetPixel(x, y, Color.FromArgb(255, 255, 255, 255));
                            }
                        }
                    }

                    // 4. Draw original artwork on top of white sticker border
                    g.DrawImage(src, pad, pad, w, h);
                }

                dest.Save(outputPath, ImageFormat.Png);
            }
        }
    }
}
"@

Add-Type -TypeDefinition $csharp -ReferencedAssemblies System.Drawing

$brainDir = "C:\Users\tatar\.gemini\antigravity\brain\391b57e0-2a71-412b-b6a8-83d2445e7ed4"
$backdropJpg = "$brainDir\talad_noi_backdrop_1794317660377.jpg"
$outProps = "public\images\ch3-taladnoi\props"

Write-Output "1. Die-cutting Talad Noi Backdrop..."
[TaladNoiProcessor]::DieCutBackdrop($backdropJpg, "$outProps\backdrop.png", 242)

Write-Output "2. Creating White Paper Sticker Outlines for Retro/Pixel Art Props..."
[TaladNoiProcessor]::AddStickerBorder("$outProps\pixel-heart.png", "$outProps\pixel-heart-sticker.png", 6)
[TaladNoiProcessor]::AddStickerBorder("$outProps\hp-bar.png", "$outProps\hp-bar-sticker.png", 5)
[TaladNoiProcessor]::AddStickerBorder("$outProps\coin.png", "$outProps\coin-sticker.png", 6)
[TaladNoiProcessor]::AddStickerBorder("$outProps\controller.png", "$outProps\controller-sticker.png", 8)

Write-Output "Done processing all Talad Noi upgrades!"
