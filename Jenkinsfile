pipeline {
  agent any

  options {
    timestamps()
    disableConcurrentBuilds()
  }

  environment {
    BACKEND_IMAGE = "todo-backend"
    FRONTEND_IMAGE = "todo-frontend"
  }

  stages {
    stage("Checkout") {
      steps {
        checkout scm
      }
    }

    stage("Set Image Tag") {
      steps {
        script {
          def shortSha = env.GIT_COMMIT ? env.GIT_COMMIT.take(7) : "dev"
          env.IMAGE_TAG = shortSha
        }
      }
    }

    stage("Build Images") {
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

            docker build -t $DOCKERHUB_USER/$BACKEND_IMAGE:$IMAGE_TAG -t $DOCKERHUB_USER/$BACKEND_IMAGE:latest backend
            docker build -t $DOCKERHUB_USER/$FRONTEND_IMAGE:$IMAGE_TAG -t $DOCKERHUB_USER/$FRONTEND_IMAGE:latest frontend
          """
        }
      }
    }

    stage("Push Images") {
      steps {
        withCredentials([
          usernamePassword(
            credentialsId: "dockerhub",
            usernameVariable: "DOCKERHUB_USER",
            passwordVariable: "DOCKERHUB_PASS"
          )
        ]) {
          sh """
            docker push $DOCKERHUB_USER/$BACKEND_IMAGE:$IMAGE_TAG
            docker push $DOCKERHUB_USER/$BACKEND_IMAGE:latest
            docker push $DOCKERHUB_USER/$FRONTEND_IMAGE:$IMAGE_TAG
            docker push $DOCKERHUB_USER/$FRONTEND_IMAGE:latest
          """
        }
      }
    }

    stage("Deploy to Kubernetes") {
      when {
        expression { return env.BRANCH_NAME == null || env.BRANCH_NAME == "main" }
      }
      steps {
        withCredentials([
          usernamePassword(
            credentialsId: "dockerhub",
            usernameVariable: "DOCKERHUB_USER",
            passwordVariable: "DOCKERHUB_PASS"
          ),
          file(credentialsId: "kubeconfig", variable: "KUBECONFIG"),
          string(credentialsId: "mongo-uri", variable: "MONGO_URI")
        ]) {
          sh """
            kubectl create secret generic app-secrets \
              --from-literal=MONGO_URI=$MONGO_URI \
              --dry-run=client -o yaml | kubectl apply -f -

            kubectl apply -f k8s/backend.yaml
            kubectl apply -f k8s/frontend.yaml

            kubectl set image deployment/backend-deployment \
              backend=$DOCKERHUB_USER/$BACKEND_IMAGE:$IMAGE_TAG
            kubectl set image deployment/frontend-deployment \
              frontend=$DOCKERHUB_USER/$FRONTEND_IMAGE:$IMAGE_TAG

            kubectl rollout status deployment/backend-deployment
            kubectl rollout status deployment/frontend-deployment
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
