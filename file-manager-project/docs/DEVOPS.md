# DevOps Learning Guide

## GitHub

1. Create a repository named `file-manager-project`.
2. Push this project.
3. Protect `main`.
4. Require pull requests.
5. Use the supplied CI workflow.
6. Create issues from the project backlog.

## GitLab

Add the GitLab repository as a mirror after the GitHub workflow is understood. The purpose is learning the differences, not maintaining two independent codebases.

## Azure DevOps

1. Create a project.
2. Connect the GitHub repository.
3. Create a pipeline from `azure-pipelines.yml`.
4. Run the Build stage.
5. Create an Azure App Service when you are ready to deploy.
6. Replace the deployment placeholder with an Azure deployment task.

## Environment variables

Backend:

```text
DATABASE_URL
PORT
CORS_ORIGIN
MAX_FILE_SIZE_MB
```

Frontend:

```text
VITE_API_URL
```

## Future production upgrade

Move uploaded files from the local `backend/uploads` directory to Azure Blob Storage. Keep PostgreSQL for metadata.
