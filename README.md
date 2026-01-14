# Movie-notebook-web
Web app for deploying on ms azure

A) Zastavit:    docker compose stop
B) Odstranit:   docker compose down
C) Odstranit i volume s DB: docker compose down -v

Zapnout znovu:  docker compose up --build
Spouštění:      docker compose up


___Click_bait_steps___

aplikace je hotová a má vytvořený [ ARM / Bicep / terraform ]

Portal
tvorba RG
Azure services -> Resource groups -> Create
	Subscription: Azure for Students
	Resource group name: rg-movie-notebook
	Region: Switzerland North
!!! Musí souhlasit s `location` v ARM
Review + create -> Create

tvorba ACR
Resource groups -> rg-movie-notebook -> Create

Marketplace vyhledej: Container Registry	(Publisher: Microsoft)
Create Container Registry – Basics
	Subscription: 	Azure for Students
	Resource group: rg-movie-notebook
	Registry name:  movienotebook		(malé a unique)
	Location:	Switzerland North
	Pricing plan:	Basic
Review + create -> Create
Počkej na: Deployment succeeded

Přístup k ACR bude řešen **Managed Identity + AcrPull přes ARM**.
STOP – OD TÉHLE CHVÍLE NIC RUČNĚ NEVYTVÁŘEJ


build & push Docker image
-> powershell
cd (cesta k aplikaci)
´´´
az login
az account set --subscription "Azure for Students"	výběr předplatného
az acr login --name movienotebook			přihlášení do ACR (zapni docker)
´´´

Backend – build & push 
´´´
docker build -t movienotebook.azurecr.io/movie-backend:latest ./backend
docker push movienotebook.azurecr.io/movie-backend:latest
´´´

Frontend – build & push
´´´
docker build -t movienotebook.azurecr.io/movie-frontend:latest ./frontend
docker push movienotebook.azurecr.io/movie-frontend:latest
´´´

Nasazení aplikace pomocí ARM

´´´
az deployment group create `
  --resource-group rg-movie-notebook `
  --template-file infra/main.json `
  --parameters `
    location=switzerlandnorth `
    acrName=movienotebook `
    acrResourceGroup=rg-movie-notebook `
    acrLoginServer=movienotebook.azurecr.io `
    backendName=movie-backend-azku `
    frontendName=movie-frontend-azku
´´´

-> vyčkej než se vše načte 
-> můžeš zobrazit aplikaci na webu
