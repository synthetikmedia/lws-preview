@echo off
cd /d C:\Users\canaa\.openclaw\workspace\siteclone
node node_modules\ts-node\dist\bin.js src\clone.ts https://www.lightwavesolar.com > clone-output.log 2>&1
