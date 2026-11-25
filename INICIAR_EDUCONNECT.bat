@echo off
title EduConnect - Lanzador
color 0B

set "PROJECT_DIR=C:\Users\anton\Downloads\Plataforma-web-institucional\"
cd /d "%PROJECT_DIR%"

echo ========================================================
echo           INICIANDO PLATAFORMA EDUCONNECT v2.0
echo ========================================================
echo.
echo Liberando puertos 8080 y 5173 si estaban ocupados...
for /f "tokens=5" %%p in ('netstat -ano ^| findstr /R ":8080 .*LISTENING"') do taskkill /F /PID %%p >nul 2>&1
for /f "tokens=5" %%p in ('netstat -ano ^| findstr /R ":5173 .*LISTENING"') do taskkill /F /PID %%p >nul 2>&1

if "%JAVA_HOME%"=="" (
    if exist "C:\Program Files\Java\jdk-21" (
        set "JAVA_HOME=C:\Program Files\Java\jdk-21"
    )
)

echo [1/2] Iniciando Backend EduConnect (Puerto 8080)...
start "EduConnect Backend (8080)" /D "%PROJECT_DIR%backend" cmd /k "mvnw.cmd spring-boot:run -Dspring-boot.run.profiles=local"

echo [2/2] Iniciando Frontend EduConnect (Puerto 5173)...
start "EduConnect Frontend (5173)" /D "%PROJECT_DIR%frontend" cmd /k "npm run dev"

echo.
echo Esperando a que EduConnect arranque para abrir el navegador...
timeout /t 10 /nobreak >nul
start "" "http://localhost:5173"

echo.
echo EduConnect iniciado en http://localhost:5173
echo No cierres las ventanas de Backend y Frontend mientras uses la plataforma.
pause