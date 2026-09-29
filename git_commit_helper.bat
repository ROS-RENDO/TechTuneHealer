@echo off
rem Check if Git is initialized. If not, initialize it and link to the new repository.
if not exist ".git" (
    echo ==================================================
    echo       [GIT INITIALIZATION]
    echo ==================================================
    echo Git repository not detected. Initializing now...
    git init
    git remote add origin https://github.com/ROS-RENDO/TechTuneHealer.git
    git branch -M main
    echo Linked repository to: https://github.com/ROS-RENDO/TechTuneHealer.git
    echo.
    echo Press any key to continue to selection menu...
    pause > nul
)

:menu
cls
echo ==================================================
echo         TECHTUNE HEALER GIT COMMIT HELPER
echo   (Single-Device Multi-Author University Sprint)
echo ==================================================
echo Select your development day to commit/push:
echo.
echo  [1]  Day 1  (Mon) - Eath Sopheavid (DB Schema)
echo  [2]  Day 2  (Tue) - Eath Sopheavid (DB Seeds)
echo  [3]  Day 3  (Wed) - Vin Sambrathna (Backend Config)
echo  [4]  Day 4  (Thu) - Vin Sambrathna (Auth Routes)
echo  [5]  Day 5  (Fri) - Vin Sambrathna (Express index/Bookings)
echo  [6]  Day 6  (Sat) - Vin Sambrathna (Shop/Diagnostics)
echo  [7]  Day 7  (Sun) - Ros Rendo (Expo/Theme Setup)
echo  [8]  Day 8  (Mon) - Ros Rendo (Navigation/API Client)
echo  [9]  Day 9  (Tue) - Ros Rendo (UI Components)
echo  [10] Day 10 (Wed) - Ros Rendo (Zustand Stores)
echo  [11] Day 11 (Thu) - Kuoch Bunpor (Expo-Router pages)
echo  [12] Day 12 (Fri) - Kuoch Bunpor (Screens/UIs config)
echo  [13] Day 13 (Sat) - Ros Rendo (Presentation Kit & Assets)
echo  [14] Day 14 (Sun) - Kuoch Bunpor (Internship Report Draft)
echo  [15] Day 15 (Mon) - Eath Sopheavid (Provider Verification DB Schema & Migrations)
echo  [16] Day 16 (Tue) - Vin Sambrathna (WebSockets Location Gateway & Admin Telemetry)
echo  [17] Day 17 (Wed) - Kuoch Bunpor (Next.js Operations Web Portal & Dispatch Terminal)
echo  [18] Day 18 (Thu) - Ros Rendo (EV Fast Charging, 3D Garage & Final Defense Docs)
echo  [Q]  Quit
echo ==================================================
set /p choice="Enter choice (1-18 or Q): "

if "%choice%"=="1" goto day1
if "%choice%"=="2" goto day2
if "%choice%"=="3" goto day3
if "%choice%"=="4" goto day4
if "%choice%"=="5" goto day5
if "%choice%"=="6" goto day6
if "%choice%"=="7" goto day7
if "%choice%"=="8" goto day8
if "%choice%"=="9" goto day9
if "%choice%"=="10" goto day10
if "%choice%"=="11" goto day11
if "%choice%"=="12" goto day12
if "%choice%"=="13" goto day13
if "%choice%"=="14" goto day14
if "%choice%"=="15" goto day15
if "%choice%"=="16" goto day16
if "%choice%"=="17" goto day17
if "%choice%"=="18" goto day18
if "%choice%"=="Q" goto quit
if "%choice%"=="q" goto quit
goto menu

:day1
echo.
echo Running Day 1 commit: Eath Sopheavid (Database Architect)
git add backend/prisma/schema.prisma
git commit --author="se6024010109-tech <se6024010109@camtech.edu.kh>" -m "feat(db): design database schema tables and relationships"
git push origin main --force
pause
goto menu

:day2
echo.
echo Running Day 2 commit: Eath Sopheavid (Database Architect)
git fetch origin main
git reset origin/main
git add backend/prisma/seed.ts backend/prisma.config.ts backend/prisma/migrations/
git commit --author="se6024010109-tech <se6024010109@camtech.edu.kh>" -m "feat(db): implement database seeds for test customers, providers, and shop products"
git push origin main
pause
goto menu

:day3
echo.
echo Running Day 3 commit: Vin Sambrathna (Backend Lead)
git fetch origin main
git reset origin/main
git add backend/src/lib/ backend/package.json backend/package-lock.json backend/.env.example backend/.gitignore backend/nodemon.json backend/tsconfig.json
git commit --author="Sambrathna Vin <sv6024010100@camtech.edu.kh>" -m "feat(backend): configure Prisma client connector and server dependencies"
git push origin main
pause
goto menu

:day4
echo.
echo Running Day 4 commit: Vin Sambrathna (Backend Lead)
git fetch origin main
git reset origin/main
git add backend/src/routes/auth.ts backend/src/routes/providers.ts
git commit --author="Sambrathna Vin <sv6024010100@camtech.edu.kh>" -m "feat(backend): build authentication routes and mechanic listing controller"
git push origin main
pause
goto menu

:day5
echo.
echo Running Day 5 commit: Vin Sambrathna (Backend Lead)
git fetch origin main
git reset origin/main
git add backend/src/index.ts backend/src/routes/bookings.ts backend/src/middleware/ backend/src/gateways/
git commit --author="Sambrathna Vin <sv6024010100@camtech.edu.kh>" -m "feat(backend): set up Express server app listener and booking controller"
git push origin main
pause
goto menu

:day6
echo.
echo Running Day 6 commit: Vin Sambrathna (Backend Lead)
git fetch origin main
git reset origin/main
git add backend/src/routes/shop.ts backend/src/routes/diagnostics.ts backend/public/ backend/src/routes/admin.ts backend/src/routes/chat.ts backend/src/routes/notifications.ts backend/src/routes/reviews.ts backend/src/routes/vehicles.ts
git commit --author="Sambrathna Vin <sv6024010100@camtech.edu.kh>" -m "feat(backend): implement e-commerce checkout routes and image diagnostic upload routes"
git push origin main
pause
goto menu

:day7
echo.
echo Running Day 7 commit: Ros Rendo (Frontend Lead)
git fetch origin main
git reset origin/main
git add src/constants/ App.tsx tsconfig.json package.json package-lock.json
git commit --author="ROS-RENDO <rousrendo@gmail.com>" -m "feat(frontend): initialize React Native app configuration, theme styles, and fonts"
git push origin main
pause
goto menu

:day8
echo.
echo Running Day 8 commit: Ros Rendo (Frontend Lead)
git fetch origin main
git reset origin/main
git add src/navigation/ src/services/ src/types/ src/utils/
git commit --author="ROS-RENDO <rousrendo@gmail.com>" -m "feat(frontend): structure bottom-tab navigation system and axios API service hooks"
git push origin main
pause
goto menu

:day9
echo.
echo Running Day 9 commit: Ros Rendo (Frontend Lead)
git fetch origin main
git reset origin/main
git add src/components/
git commit --author="ROS-RENDO <rousrendo@gmail.com>" -m "feat(frontend): design reusable UI components library for buttons and input fields"
git push origin main
pause
goto menu

:day10
echo.
echo Running Day 10 commit: Ros Rendo (Frontend Lead)
git fetch origin main
git reset origin/main
git add src/store/
git commit --author="ROS-RENDO <rousrendo@gmail.com>" -m "feat(frontend): set up global Zustand state management stores for user auth and location"
git push origin main
pause
goto menu

:day11
echo.
echo Running Day 11 commit: Kuoch Bunpor (QA & Frontend)
git fetch origin main
git reset origin/main
git add app/
git commit --author="Douai-hub <bk6024010108@camtech.edu.kh>" -m "feat(frontend): configure Expo-Router path links and screen loaders"
git push origin main
pause
goto menu

:day12
echo.
echo Running Day 12 commit: Kuoch Bunpor (QA & Frontend)
git fetch origin main
git reset origin/main
git add src/screens/ app.json babel.config.js eslint.config.js sonar-project.properties README.md .env.example .gitignore
git commit --author="Douai-hub <bk6024010108@camtech.edu.kh>" -m "feat(frontend): implement UI screens for mechanic listings, parts shop, and diagnostic results"
git push origin main
pause
goto menu

:day13
echo.
echo Running Day 13 commit: Ros Rendo (Frontend & UI Lead)
git fetch origin main
git reset origin/main
git add TechTune_Healer_Presentation_Kit.md images/
git commit --author="ROS-RENDO <rousrendo@gmail.com>" -m "docs: compile master presentation deck slides and script guidelines"
git push origin main
pause
goto menu

:day14
echo.
echo Running Day 14 commit: Kuoch Bunpor (QA & Frontend)
git fetch origin main
git reset origin/main
git add TechTune_Healer_Internship_Report.md TechTune_Healer_Commit_Plan_Sprint.csv git_commit_helper.txt git_commit_helper.bat
git commit --author="Douai-hub <bk6024010108@camtech.edu.kh>" -m "docs: add initial internship report draft and 14-day team collaboration roadmap"
git push origin main
pause
goto menu

:day15
echo.
echo Running Day 15 commit: Eath Sopheavid (Database & System Architect)
git fetch origin main
git reset origin/main
git add backend/prisma/schema.prisma backend/prisma/migrations/ backend/prisma/seed.ts backend/prisma.config.ts
git commit --author="se6024010109-tech <se6024010109@camtech.edu.kh>" -m "feat(db): update provider verification schema with approval status and database migrations"
git push origin main
pause
goto menu

:day16
echo.
echo Running Day 16 commit: Vin Sambrathna (Backend Lead)
git fetch origin main
git reset origin/main
git add backend/src/routes/admin.ts backend/src/routes/chat.ts backend/src/routes/notifications.ts backend/src/routes/reviews.ts backend/src/routes/vehicles.ts backend/src/gateways/ backend/src/middleware/ backend/tsconfig.json backend/nodemon.json backend/.env.example backend/.gitignore
git commit --author="Sambrathna Vin <sv6024010100@camtech.edu.kh>" -m "feat(backend): implement Socket.io location gateway, security middleware, and admin telemetry engine"
git push origin main
pause
goto menu

:day17
echo.
echo Running Day 17 commit: Kuoch Bunpor (QA & Fullstack Web)
git fetch origin main
git reset origin/main
git add admin-web/
git commit --author="Douai-hub <bk6024010108@camtech.edu.kh>" -m "feat(admin-web): build Next.js operations portal with live dispatch matrix and workshop approval console"
git push origin main
pause
goto menu

:day18
echo.
echo Running Day 18 commit: Ros Rendo (Frontend & Mobile Lead)
git fetch origin main
git reset origin/main
git add src/data/ src/screens/ src/utils/ src/components/AnimatedEntrance.tsx src/components/CameraCapture.tsx src/services/googleAuth.ts src/store/vehicleStore.ts src/navigation/ app/ package.json package-lock.json TechTune_Healer_Presentation_Kit.md TechTune_Healer_Internship_Report.md TechTune_Healer_Commit_Plan_Sprint.csv git_commit_helper.bat git_commit_helper.txt sonar-project.properties eslint.config.js README.md .gitignore specs/ .specify/ .agents/
git commit --author="ROS-RENDO <rousrendo@gmail.com>" -m "feat(mobile): integrate EV charging hubs, 3D garage telemetry, and finalize defense documentation"
git push origin main
pause
goto menu

:quit
echo Goodbye!
exit
