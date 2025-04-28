# Proofs Dashboard

A Next.js application for managing and viewing print proofs.

## Prerequisites

- Node.js 20.x or later
- PostgreSQL 15.x or later
- npm 10.x or later

## Getting Started

Make sure your VPN (Pritunl or Cloudfare) is turned off, as localhost uses self signed certificates and this will cause issues when installing dependencies and fetching from AWS.

### 1. Install PostgreSQL

#### macOS (using Homebrew)
```bash
# Install Homebrew if you don't have it
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install PostgreSQL
brew install postgresql

# Start PostgreSQL service
brew services start postgresql
```
If you installed postgres previously using another installer, you may need to use `brew install` and `brew services start` so the ports are found successfully and you don't run into user permission issues

### 2. Set Up the Database

```bash
# Create the database (this will use your system username as the PostgreSQL user)
createdb proofs_dashboard

```

### 3. Clone and Set Up the Project

```bash
# Clone the repository
git clone git@github.com:lob/proofs-dashboard.git
cd proofs-dashboard

# Install dependencies
npm install

# Create .env file
cp .env.example .env
```

Edit the `.env` file with actual environment variable. When using homebrew to run postgres, the DATABASE_URL should use your system username:
```
# Get your system username
whoami

# Use that username in your DATABASE connection in .env
DATABASE_URL="postgresql://{user}:postgres@localhost:5432/proofs_dashboard"
```

### 4. Initialize the Database

```bash
# Generate Prisma client (will get warning about output path, fixing this is future release)
npx prisma generate

# Run database migrations
npx prisma migrate dev

# Populate the database with dummy data
# The Urls attributes of the dummy proofs rely on those objects existing in S3 as .png files
node scripts/generateDummyData.mjs
```

### 5. Start the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

You will need to login with your provisioned creds, you will be prompted to reset your password.

## Project Structure

- `app/` - Next.js application code
- `prisma/` - Database schema and migrations
- `public/` - Static assets
- `lib/` - Shared utilities and configurations
- `scripts/` - Utility scripts: seed database and delete all db items

## Environment Variables

The following environment variables are required:

- `DATABASE_URL` - PostgreSQL connection string
- `AWS_REGION` - AWS region for S3
- `AWS_ACCESS_KEY_ID` - AWS access key
- `AWS_SECRET_ACCESS_KEY` - AWS secret key
- `AWS_S3_BUCKET` - S3 bucket name
- `NEXT_PUBLIC_COGNITO_USER_POOL_ID` - Cognito user pool ID
- `NEXT_PUBLIC_COGNITO_CLIENT_ID` - Cognito client ID

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npx prisma generate` - Generate Prisma client
- `npx prisma migrate dev` - Run database migrations
- `npx ts-node scripts/generateDummyData.ts` - Populate database with dummy data
- `npx ts-node scripts/deleteProofs.ts` - Deletes all items in the database

## Troubleshooting

### Database Connection Issues
- Ensure PostgreSQL is running
- Verify database credentials in `.env`
- Check if the database exists
- If you see "User postgres was denied access" error, make sure you're using your system username in the DATABASE_URL
- If using postgres.app, the username is likely 'postgres'

### Node.js Version Issues
- Use `nvm` to manage Node.js versions
- Ensure you're using Node.js 20.x or later

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
