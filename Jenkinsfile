pipeline {
  agent any

  options {
    timestamps()
    disableConcurrentBuilds()
  }

  environment {
    BACKEND_IMAGE = "todo-backend"
    FRONTEND_IMAGE = "todo-frontend"
    IMAGE_TAG = "latest"
  }

  stages {
    stage("Checkout") {
      steps {
        checkout([
          $class: 'GitSCM',
          branches: [[name: '*/main']],
          userRemoteConfigs: [[url: 'https://github.com/PrinceKumar101/INT377.git']]
        ])
      }
    }

    stage("Build, Push, Deploy") {
      steps {
        withCredentials([
          usernamePassword(
            credentialsId: "dockerhub",
            usernameVariable: "DOCKERHUB_USER",
            passwordVariable: "DOCKERHUB_PASS"
          ),
          file(
            credentialsId: "K8s secrect file",
            variable: "K8S_SECRET_FILE"
          )
        ]) {
          script {
            if (isUnix()) {
              sh '''
                IMAGE_TAG=$(git rev-parse --short HEAD)
                echo "$DOCKERHUB_PASS" | docker login -u "$DOCKERHUB_USER" --password-stdin

                export KUBECONFIG="$K8S_SECRET_FILE"

                docker buildx build --platform linux/amd64 -t $DOCKERHUB_USER/$BACKEND_IMAGE:$IMAGE_TAG --push backend
                docker buildx build --platform linux/amd64 -t $DOCKERHUB_USER/$FRONTEND_IMAGE:$IMAGE_TAG --push frontend

                kubectl apply -f k8s/backend.yaml
                kubectl apply -f k8s/frontend.yaml

                kubectl set image deployment/backend-deployment \
                  backend=$DOCKERHUB_USER/$BACKEND_IMAGE:$IMAGE_TAG
                kubectl set image deployment/frontend-deployment \
                  frontend=$DOCKERHUB_USER/$FRONTEND_IMAGE:$IMAGE_TAG
              '''
            } else {
              bat '''
@echo off

docker logout >nul 2>&1
powershell -NoProfile -Command "$env:DOCKERHUB_PASS | docker login -u $env:DOCKERHUB_USER --password-stdin"
if %errorlevel% neq 0 exit /b %errorlevel%

for /f %%i in ('git rev-parse --short HEAD') do set IMAGE_TAG=%%i

set KUBECONFIG=%K8S_SECRET_FILE%

docker buildx build --platform linux/amd64 -t %DOCKERHUB_USER%/%BACKEND_IMAGE%:%IMAGE_TAG% --push backend
if %errorlevel% neq 0 exit /b %errorlevel%

docker buildx build --platform linux/amd64 -t %DOCKERHUB_USER%/%FRONTEND_IMAGE%:%IMAGE_TAG% --push frontend
if %errorlevel% neq 0 exit /b %errorlevel%

kubectl apply -f k8s/backend.yaml
if %errorlevel% neq 0 exit /b %errorlevel%

kubectl apply -f k8s/frontend.yaml
if %errorlevel% neq 0 exit /b %errorlevel%

kubectl set image deployment/backend-deployment backend=%DOCKERHUB_USER%/%BACKEND_IMAGE%:%IMAGE_TAG%
if %errorlevel% neq 0 exit /b %errorlevel%

kubectl set image deployment/frontend-deployment frontend=%DOCKERHUB_USER%/%FRONTEND_IMAGE%:%IMAGE_TAG%
if %errorlevel% neq 0 exit /b %errorlevel%
'''
            }
          }
        }
      }
    }
  }

  post {
    always {
      script {
        if (env.NODE_NAME) {
          if (isUnix()) {
            sh "docker logout || true"
          } else {
            bat "docker logout || exit /b 0"
          }
        }
      }
    }
  }
}
