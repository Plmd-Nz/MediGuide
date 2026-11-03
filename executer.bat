@echo off
chcp 65001 >nul
title SIOM - Systeme Intelligent d'Orientation Medicale
cd /d "%~dp0"

echo ==============================================================
echo   SIOM - Systeme Intelligent d'Orientation Medicale (RDC)
echo   Lancement automatique de l'interface Web Streamlit
echo ==============================================================
echo.

:: 1. Verification de Python
where python >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERREUR] Python n'a pas ete trouve dans votre variable d'environnement PATH.
    echo Veuillez installer Python ou verifier votre configuration.
    echo.
    pause
    exit /b 1
)

:: 2. Verification du dataset prepare
if not exist "donnees\dataset_prepare\dataset_prepare.csv" (
    echo [INFO] Dataset prepare introuvable. Generation automatique en cours...
    python traitement\enrichissement_dataset.py
    if %errorlevel% neq 0 (
        echo [ERREUR] Echec lors de la preparation du dataset medical.
        pause
        exit /b 1
    )
    echo [OK] Dataset prepare genere avec succes.
    echo.
)

:: 3. Verification de la disponibilite de Streamlit
python -m streamlit --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ATTENTION] Streamlit n'est pas installe dans cet environnement Python.
    echo Installation des dependances depuis requirements.txt...
    python -m pip install -r requirements.txt
    if %errorlevel% neq 0 (
        echo [ERREUR] Echec de l'installation des dependances.
        pause
        exit /b 1
    )
)

:: 4. Lancement de l'interface Streamlit
echo [INFO] Lancement de l'application SIOM...
echo L'interface web va s'ouvrir automatiquement sur http://localhost:8501
echo (Appuyez sur Ctrl+C dans cette fenetre pour arreter le serveur)
echo.

python -m streamlit run interface\application_streamlit.py

if %errorlevel% neq 0 (
    echo.
    echo [ERREUR] Le serveur Streamlit s'est arrete avec une erreur.
    pause
)
