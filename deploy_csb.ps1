$ErrorActionPreference = "Stop"

$appPath = ".\App.jsx"
$AppJsxContent = Get-Content -Raw $appPath

$files = @{
    "package.json" = @{
        content = @{
            dependencies = @{
                "react" = "^18.2.0"
                "react-dom" = "^18.2.0"
                "react-scripts" = "5.0.1"
                "lucide-react" = "latest"
                "firebase" = "^10.8.0"
            }
            scripts = @{
                "start" = "react-scripts start"
                "build" = "react-scripts build"
            }
        }
    }
    "public/index.html" = @{
        content = "<!DOCTYPE html><html lang='en'><head><meta charset='utf-8'><script src='https://cdn.tailwindcss.com'></script></head><body><div id='root'></div></body></html>"
    }
    "src/index.js" = @{
        content = "import React from 'react';`nimport { createRoot } from 'react-dom/client';`nimport App from './App';`n`nconst root = createRoot(document.getElementById('root'));`nroot.render(<App />);"
    }
    "src/App.jsx" = @{
        content = $AppJsxContent
    }
}

$payload = @{ files = $files }
$json = $payload | ConvertTo-Json -Depth 15

Write-Output "Sending payload to CodeSandbox..."
$response = Invoke-RestMethod -Uri "https://codesandbox.io/api/v1/sandboxes/define?json=1" -Method Post -Body $json -ContentType "application/json"

Write-Output ""
Write-Output "--- DEPLOYMENT SUCCESSFUL ---"
Write-Output "SANDBOX ID: $($response.sandbox_id)"
Write-Output "EDITOR URL: https://codesandbox.io/s/$($response.sandbox_id)"
Write-Output "APP PREVIEW: https://$($response.sandbox_id).csb.app/"
Write-Output "-----------------------------"
