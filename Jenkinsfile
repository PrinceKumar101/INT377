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
        checkout scm
      }
    }

    stage("Build, Push, Deploy") {
      steps {
        withCredentials([
          usernamePassword(
            credentialsId: "dockerhub",
            usernameVariable: "DOCKERHUB_USER",
            passwordVariable: "DOCKERHUB_PASS"
          )
        ]) {
          sh """
            echo "$DOCKERHUB_PASS" | docker login -u "$DOCKERHUB_USER" --password-stdin

            docker build -t $DOCKERHUB_USER/$BACKEND_IMAGE:$IMAGE_TAG backend
            docker build -t $DOCKERHUB_USER/$FRONTEND_IMAGE:$IMAGE_TAG frontend

            docker push $DOCKERHUB_USER/$BACKEND_IMAGE:$IMAGE_TAG
            docker push $DOCKERHUB_USER/$FRONTEND_IMAGE:$IMAGE_TAG

            kubectl apply -f k8s/backend.yaml
            kubectl apply -f k8s/frontend.yaml

            kubectl set image deployment/backend-deployment \
              backend=$DOCKERHUB_USER/$BACKEND_IMAGE:$IMAGE_TAG
            kubectl set image deployment/frontend-deployment \
              frontend=$DOCKERHUB_USER/$FRONTEND_IMAGE:$IMAGE_TAG
          """
        }
      }
    }
  }

  post {
    always {
      sh "docker logout || true"
    }
  }
}
