
#!/bin/bash
echo "Syncing changes to GitHub..."
git add .
git commit -m "Auto-sync: $(date '+%Y-%m-%d %H:%M:%S')"
git push --force origin main
echo "✅ Changes force-synced to GitHub!"
