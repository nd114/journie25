
#!/bin/bash
echo "Syncing changes to GitHub..."
git add .
git commit -m "Auto-sync: $(date '+%Y-%m-%d %H:%M:%S')"
git push origin main
echo "✅ Changes synced to GitHub!"
