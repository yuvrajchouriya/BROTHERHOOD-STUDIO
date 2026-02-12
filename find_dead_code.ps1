$components = Get-ChildItem -Path "src\components" -Recurse -Filter "*.tsx"
$candidates = @()

foreach ($comp in $components) {
    if ($comp.Name -like "index.ts*") { continue }
    $name = $comp.BaseName
    
    # Search in all .tsx and .ts files in src
    try {
        $matches = Get-ChildItem -Path "src" -Recurse -Include "*.tsx", "*.ts" | 
                   Select-String -Pattern "$name" -SimpleMatch | 
                   Measure-Object | Select-Object -ExpandProperty Count
    } catch {
        $matches = 0
    }

    if ($matches -le 1) {
        $candidates += [PSCustomObject]@{
            Name = $name
            Path = $comp.FullName
            Count = $matches
        }
    }
}

$candidates | Format-Table -AutoSize
