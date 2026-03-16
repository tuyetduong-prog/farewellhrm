$ErrorActionPreference = "Stop"
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

try {
    Write-Host "Reading App.jsx..."
    $AppJsxContent = Get-Content -Raw ".\App.jsx"

    $packageJson = @{
        "name" = "hanh-trinh-ruc-ro"
        "private" = $true
        "version" = "0.0.0"
        "type" = "module"
        "scripts" = @{
            "dev" = "vite"
            "build" = "vite build"
            "preview" = "vite preview"
        }
        "dependencies" = @{
            "react" = "^18.2.0"
            "react-dom" = "^18.2.0"
            "lucide-react" = "^0.330.0"
            "firebase" = "^10.8.0"
        }
        "devDependencies" = @{
            "@vitejs/plugin-react" = "^4.2.1"
            "vite" = "^5.2.8"
        }
    }

    $packageJsonStr = $packageJson | ConvertTo-Json -Depth 5 -Compress

    $files = @{
        "package.json" = @{ content = $packageJsonStr }
        "vite.config.js" = @{ content = "import { defineConfig } from 'vite';`nimport react from '@vitejs/plugin-react';`nexport default defineConfig({ plugins: [react()] });" }
        "index.html" = @{ content = "<!doctype html>`n<html lang=`"en`">`n  <head>`n    <meta charset=`"UTF-8`" />`n    <meta name=`"viewport`" content=`"width=device-width, initial-scale=1.0`" />`n    <script src=`"https://cdn.tailwindcss.com`"></script>`n    <title>Hành trình Rực rỡ</title>`n  </head>`n  <body>`n    <div id=`"root`"></div>`n    <script type=`"module`" src=`"/src/main.jsx`"></script>`n  </body>`n</html>" }
        "src/main.jsx" = @{ content = "import React from 'react';`nimport { createRoot } from 'react-dom/client';`nimport App from './App.jsx';`n`ncreateRoot(document.getElementById('root')).render(`n  <React.StrictMode>`n    <App />`n  </React.StrictMode>,`n);" }
        "src/App.jsx" = @{ content = $AppJsxContent }
    }

    Write-Host "Converting to JSON..."
    $payloadDirect = @{ files = $files }
    $json = $payloadDirect | ConvertTo-Json -Depth 5 -Compress

    Write-Host "Preparing API request to CodeSandbox..."
    $request = [System.Net.WebRequest]::Create("https://codesandbox.io/api/v1/sandboxes/define?json=1")
    $request.Method = "POST"
    $request.ContentType = "application/json"
    $request.Accept = "application/json"

    $bytes = [System.Text.Encoding]::UTF8.GetBytes($json)
    $request.ContentLength = $bytes.Length

    Write-Host "Sending data..."
    $stream = $request.GetRequestStream()
    $stream.Write($bytes, 0, $bytes.Length)
    $stream.Close()

    Write-Host "Waiting for response..."
    $response = $request.GetResponse()
    $reader = New-Object System.IO.StreamReader($response.GetResponseStream())
    $result = $reader.ReadToEnd()
    
    $parsed = $result | ConvertFrom-Json
    $sandboxId = $parsed.sandbox_id
    
    Write-Host "`n================================================"
    Write-Host "   DEPLOYMENT SUCCESSFUL!   "
    Write-Host "   URL: https://$sandboxId.csb.app/"
    Write-Host "   SANDBOX ID: $sandboxId"
    Write-Host "================================================`n"
}
catch {
    Write-Host "ERROR: $($_.Exception.Message)"
    if ($_.Exception.Response) {
        $r = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        Write-Host "SERVER RESPONSE: $($r.ReadToEnd())"
    }
}
