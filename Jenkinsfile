pipeline {
  agent { docker 'node:6.3' }
  stages {
    stage('build') {
      steps {
        'npm --version'
        'npm install'
        'npm test'
      }
    }
  }
}
