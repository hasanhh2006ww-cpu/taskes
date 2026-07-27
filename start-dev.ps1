@
echo "Starting Next.js dev server..."
Start-Process -NoNewWindow -FilePath "cmd.exe" -ArgumentList "/c", "npx next dev --port 3000" -WorkingDirectory "C:\Users\user\Desktop\taskes\my-taske"
Start-Sleep -Seconds 10
echo "Server should be ready"

