$ErrorActionPreference = "Stop"

$appPath = ".\App.jsx"
$AppJsxContent = Get-Content -Raw $appPath

# Remove export default App at the bottom
$AppJsxContent = $AppJsxContent -replace "export default App;", ""

$indexHtmlContent = @"
<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Hành trình Rực rỡ</title>
    <!-- TailwindCSS -->
    <script src="https://cdn.tailwindcss.com"></script>
    <!-- Babel Standalone for compiling JSX in the browser -->
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
    <script type="importmap">
    {
        "imports": {
            "react": "https://esm.sh/react@18.2.0",
            "react-dom/client": "https://esm.sh/react-dom@18.2.0/client",
            "firebase/app": "https://esm.sh/firebase@10.8.0/app",
            "firebase/firestore": "https://esm.sh/firebase@10.8.0/firestore",
            "firebase/auth": "https://esm.sh/firebase@10.8.0/auth",
            "lucide-react": "https://esm.sh/lucide-react@0.330.0"
        }
    }
    </script>
</head>
<body>
    <div id="root"></div>
    <script type="text/babel" data-type="module">
        import { createRoot } from 'react-dom/client';
        
        // --- 100% Nguyên bản code App.jsx ---
        $AppJsxContent
        // ------------------------------------

        const root = createRoot(document.getElementById('root'));
        root.render(<App />);
    </script>
</body>
</html>
"@

$indexHtmlContent | Out-File -FilePath ".\App_Standalone.html" -Encoding utf8
Write-Output "Successfully compiled to App_Standalone.html!"
