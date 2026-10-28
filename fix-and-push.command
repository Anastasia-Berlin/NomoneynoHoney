#!/bin/bash
cd "/Users/nastia/Desktop/NoMoneyNoHoney.io"
rm -f .git/index.lock
rm -f .git/HEAD.lock
git add -A
git commit -m "Kontaktseite: Info-Panel links, Formular rechts, Labels vereinfacht"
git push origin main
echo ""
echo "✅ Fertig! Dieses Fenster schließt in 5 Sekunden..."
sleep 5
