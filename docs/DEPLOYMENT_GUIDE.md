# DEPLOYMENT GUIDE - GENESIS

## Prerequisites
- Terraform >= 1.0
- Azure CLI authenticated
- Vercel CLI authenticated
- Node.js >= 20

## Steps

1. **Infrastructure Provisioning**
   ```bash
   cd infrastructure/terraform
   terraform init
   terraform apply -var="vercel_api_token=YOUR_TOKEN"
   ```

2. **Application Build**
   ```bash
   pnpm install
   pnpm build
   ```

3. **Deploy to Vercel**
   ```bash
   vercel --prod
   ```

## Environment Variables
- `AZURE_COSMOS_CONNECTION_STRING`: From Terraform output
- `OPENAI_API_KEY`: Securely stored
- `ANTHROPIC_API_KEY`: Securely stored
- `QUANTUM_SECRET_KEY`: For internal encryption
