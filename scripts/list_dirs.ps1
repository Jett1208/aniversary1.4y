$dirs = Get-ChildItem -LiteralPath "asset(props)" -Directory
for ($i = 0; $i -lt $dirs.Count; $i++) {
    Write-Output "[$i] $($dirs[$i].Name)"
}
