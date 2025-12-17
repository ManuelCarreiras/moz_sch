# CI/CD Setup Guide

This document provides a quick reference for the CI/CD setup.

## Quick Start

### 1. Configure GitHub Secrets

Go to: **Repository → Settings → Secrets and variables → Actions**

Add these secrets:

```
DOPPLER_TOKEN=your_doppler_token
PROD_SERVER_HOST=your-prod-server-ip
PROD_SERVER_USER=your-ssh-username
PROD_SSH_KEY=your-private-ssh-key
AWS_COGNITO_USERPOOL_ID=your-cognito-pool-id
AWS_COGNITO_APP_CLIENT_ID=your-cognito-client-id
PROD_API_BASE_URL=https://api.yourdomain.com (optional)
```

### 2. Generate SSH Keys

```bash
# Generate key for production server
ssh-keygen -t ed25519 -C "github-actions-prod" -f ~/.ssh/github_actions_prod

# Add public key to production server
ssh-copy-id -i ~/.ssh/github_actions_prod.pub user@prod-server

# Copy private key to GitHub Secrets
cat ~/.ssh/github_actions_prod  # Copy to PROD_SSH_KEY
```

### 3. Prepare Production Server

On your production server:

```bash
# Install Docker and Docker Compose
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
sudo apt-get install docker-compose-plugin -y

# Clone repository
cd ~
git clone <your-repo-url> moz_sch
cd moz_sch

# Install Doppler CLI (optional, if using Doppler)
curl -Ls --tlsv1.2 --proto "=https" --retry 3 https://cli.doppler.com/install.sh | sh
```

### 4. Test the Pipeline

1. **Create a test branch:**
   ```bash
   git checkout -b test-ci
   git push origin test-ci
   ```

2. **Check GitHub Actions:**
   - Go to **Actions** tab
   - You should see the CI workflow running
   - Wait for it to complete

3. **Test Production Deployment:**
   ```bash
   git checkout main
   git push origin main
   ```
   - This will trigger production deployment
   - Or use manual workflow dispatch from GitHub Actions tab

## Workflow Details

### CI Workflow
- **Triggers**: All PRs and pushes
- **Runs**: Tests, linting, type checking, Docker builds
- **Duration**: ~5-10 minutes

### Production Deployment
- **Trigger**: Push to `main` branch or manual
- **Process**: Test → Build → Backup → Deploy → Health Check → Rollback on failure
- **Duration**: ~15-20 minutes
- **Safety**: Can require manual approval (configure in GitHub Environments)

## Troubleshooting

### CI Fails
- Check test output in Actions tab
- Run tests locally: `docker compose exec api pytest`
- Fix TypeScript errors: `cd frontend && npx tsc --noEmit`

### Deployment Fails
- **SSH Issues**: Verify SSH key is correct and added to server
- **Server Access**: Test SSH manually: `ssh user@server`
- **Docker Issues**: Ensure Docker is installed and user has permissions
- **Port Conflicts**: Check if ports 5000, 3000, 5432 are available
- **Disk Space**: Ensure server has enough space: `df -h`

### Health Checks Fail
- Check API: `curl http://localhost:5000/`
- Check Frontend: `curl http://localhost:3000/`
- View logs: `docker compose logs api frontend`
- Check container status: `docker compose ps`

## Best Practices

1. **Always test locally first** before pushing
2. **Use feature branches** and create PRs for review
3. **Monitor deployments** in GitHub Actions tab
4. **Keep secrets secure** - never commit them
5. **Review logs** if deployment fails
6. **Test rollback procedure** before production deployment

## Next Steps

- Set up monitoring and alerts
- Configure production environment protection (manual approval)
- Consider using container registry (Docker Hub, ECR) for faster deployments
- Add database migration steps if needed
- Set up staging environment if needed


