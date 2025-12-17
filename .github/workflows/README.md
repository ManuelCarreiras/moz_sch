# GitHub Actions Workflows

This directory contains CI/CD workflows for the Santa Isabel Escola project.

## Workflows

### CI (`ci.yml`)
Runs on every pull request and push to any branch. Performs:
- API unit tests with pytest and coverage
- Frontend TypeScript type checking
- Frontend linting
- Docker image build verification

### Deploy to Production (`deploy-prod.yml`)
Deploys to production server when code is pushed to `main` branch or manually triggered:
1. Runs CI tests
2. Builds Docker images
3. Creates backup of current deployment
4. Deploys via SSH to prod server
5. Performs health checks with retries
6. Automatic rollback on failure

## Setup

### 1. Configure GitHub Secrets

Go to your repository → Settings → Secrets and variables → Actions, and add:

**Required Secrets:**
- `DOPPLER_TOKEN` - Doppler token for secrets management
- `PROD_SERVER_HOST` - Production server hostname/IP
- `PROD_SERVER_USER` - SSH username for prod server
- `PROD_SSH_KEY` - Private SSH key for prod server
- `AWS_COGNITO_USERPOOL_ID` - AWS Cognito User Pool ID
- `AWS_COGNITO_APP_CLIENT_ID` - AWS Cognito App Client ID

**Optional Secrets:**
- `PROD_API_BASE_URL` - API base URL for production

### 2. Generate SSH Keys

On your local machine:
```bash
# Generate SSH key for production server
ssh-keygen -t ed25519 -C "github-actions-prod" -f ~/.ssh/github_actions_prod
```

Add the public key to your production server:
```bash
# On production server
cat ~/.ssh/github_actions_prod.pub >> ~/.ssh/authorized_keys
```

Add the private key to GitHub Secrets:
- Copy `~/.ssh/github_actions_prod` → `PROD_SSH_KEY`

### 3. Server Preparation

On your deployment servers, ensure:
- Docker and Docker Compose are installed
- Git is installed
- Repository is cloned to `~/moz_sch` or `/opt/moz_sch`
- SSH access is configured
- Firewall allows required ports (5000, 3000, 5432, etc.)
- Doppler CLI is installed (or configure environment variables)

### 4. Production Environment Protection (Optional)

To require manual approval for production deployments:
1. Go to repository → Settings → Environments
2. Create "production" environment
3. Enable "Required reviewers"
4. Add reviewers who must approve deployments

## Usage

### Automatic Deployments
- Push to `main` branch → Automatic deployment to production (or requires approval if configured)

### Manual Deployment
1. Go to Actions tab in GitHub
2. Select "Deploy to Production" workflow
3. Click "Run workflow"
4. Select branch and click "Run workflow"

## Troubleshooting

### CI Fails
- Check test output in Actions tab
- Ensure all tests pass locally
- Verify TypeScript has no errors

### Deployment Fails
- Check SSH connection: `ssh user@server`
- Verify server has Docker and Docker Compose
- Check server logs: `docker compose logs`
- Verify GitHub secrets are correct
- Check server disk space

### Health Checks Fail
- Verify API is running: `curl http://localhost:5000/`
- Verify Frontend is running: `curl http://localhost:3000/`
- Check container logs: `docker compose logs api frontend`
- Ensure ports are not blocked by firewall


