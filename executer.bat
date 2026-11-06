@echo off
setlocal EnableDelayedExpansion
title MediGuide RDC - Lancement Conjoint
cd /d "%~dp0"

echo ==============================================================================
echo    MediGuide RDC - Systeme Intelligent d Orientation Medicale [SIOM]
echo    Lancement Simultane : Backend FastAPI [8000] et Frontend Next.js [3000]
echo ==============================================================================
echo.

:: 1. Verification de Python
where python >nul 2>&1
if errorlevel 1 (
    echo [ERREUR] Python n a pas ete trouve dans votre variable PATH.
    echo Veuillez installer Python ou verifier votre configuration.
    pause
    exit /b 1
)

:: 2. Verification de Node.js et npm
where npm >nul 2>&1
if errorlevel 1 (
    echo [ERREUR] Node.js ou npm n a pas ete trouve dans votre variable PATH.
    echo Veuillez installer Node.js pour executer le Frontend Next.js.
    pause
    exit /b 1
)

:: 3. Verification du dataset prepare
if not exist "donnees\dataset_prepare\dataset_prepare.csv" (
    echo [INFO] Dataset prepare introuvable. Generation automatique en cours...
    python traitement\enrichissement_dataset.py
    if errorlevel 1 (
        echo [ERREUR] Echec lors de la preparation du dataset medical.
        pause
        exit /b 1
    )
    echo [OK] Dataset prepare genere avec succes.
    echo.
)

:: 4. Verification des modules backend Python
python -c "import fastapi, uvicorn, multipart" >nul 2>&1
if errorlevel 1 (
    echo [INFO] Installation des dependances Python...
    python -m pip install -r requirements.txt
    if errorlevel 1 (
        echo [ERREUR] Echec de l installation des dependances Python.
        pause
        exit /b 1
    )
    echo [OK] Dependances Python pretes.
    echo.
)

:: 5. Verification des modules frontend
if not exist "Frontend\node_modules" (
    echo [INFO] Installation des dependances npm du Frontend...
    cd Frontend
    call npm install
    cd ..
    if errorlevel 1 (
        echo [ERREUR] Echec de npm install dans Frontend.
        pause
        exit /b 1
    )
    echo [OK] Dependances Frontend pretes.
    echo.
)

:: 6. Lancement du Backend FastAPI
echo [1/2] Lancement du Backend REST FastAPI sur http://127.0.0.1:8000 ...
start "MediGuide - Backend FastAPI" cmd /k "python -m uvicorn api:app --host 127.0.0.1 --port 8000"

:: 7. Temporisation
ping 127.0.0.1 -n 3 >nul

:: 8. Lancement du Frontend Next.js
echo [2/2] Lancement du Frontend Next.js sur http://localhost:3000 ...
start "MediGuide - Frontend Next.js" cmd /k "cd /d Frontend && npm run dev"

:: 9. Temporisation et ouverture du navigateur
echo.
echo ==============================================================================
echo [SUCCES] MediGuide RDC est en cours d execution !
echo.
echo   - Interface Web Utilisateur : http://localhost:3000
echo   - Documentation API Swagger : http://127.0.0.1:8000/docs
echo.
echo Les serveurs s executent dans leurs fenetres dediees.
echo Vous pouvez reduire cette fenetre.
echo Pour arreter les serveurs, fermez leurs fenetres respectives.
echo ==============================================================================
echo.

ping 127.0.0.1 -n 4 >nul
start http://localhost:3000

echo Appuyez sur une touche pour quitter cette fenetre de controle...
pause >nul
