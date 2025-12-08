#!/usr/bin/env node

/**
 * Safeguard script to prevent accidental Prisma upgrades
 * This runs before npm install to check if Prisma versions are being changed
 */

const fs = require('fs');
const path = require('path');

const ALLOWED_PRISMA_VERSION = '6.9.0';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const RESET = '\x1b[0m';

function checkPrismaVersion() {
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  
  if (!fs.existsSync(packageJsonPath)) {
    console.log(`${YELLOW}Warning: package.json not found${RESET}`);
    return;
  }

  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  
  const prismaClientVersion = packageJson.dependencies?.['@prisma/client'];
  const prismaVersion = packageJson.devDependencies?.['prisma'];

  // Check if versions match the allowed version
  const clientMismatch = prismaClientVersion && !prismaClientVersion.includes(ALLOWED_PRISMA_VERSION);
  const prismaMismatch = prismaVersion && !prismaVersion.includes(ALLOWED_PRISMA_VERSION);

  if (clientMismatch || prismaMismatch) {
    console.error(`${RED}╔════════════════════════════════════════════════════════════════╗${RESET}`);
    console.error(`${RED}║  ⚠️  PRISMA VERSION CHANGE DETECTED                            ║${RESET}`);
    console.error(`${RED}╠════════════════════════════════════════════════════════════════╣${RESET}`);
    console.error(`${RED}║                                                                ║${RESET}`);
    console.error(`${RED}║  Allowed version: ${ALLOWED_PRISMA_VERSION}                                      ║${RESET}`);
    
    if (clientMismatch) {
      console.error(`${RED}║  Found @prisma/client: ${prismaClientVersion?.padEnd(36)} ║${RESET}`);
    }
    if (prismaMismatch) {
      console.error(`${RED}║  Found prisma: ${prismaVersion?.padEnd(44)} ║${RESET}`);
    }
    
    console.error(`${RED}║                                                                ║${RESET}`);
    console.error(`${RED}║  Upgrading Prisma may cause breaking changes!                 ║${RESET}`);
    console.error(`${RED}║                                                                ║${RESET}`);
    console.error(`${RED}║  To bypass this check, set:                                   ║${RESET}`);
    console.error(`${RED}║  ALLOW_PRISMA_UPGRADE=true npm install                        ║${RESET}`);
    console.error(`${RED}║                                                                ║${RESET}`);
    console.error(`${RED}╚════════════════════════════════════════════════════════════════╝${RESET}`);

    // Allow bypass with environment variable
    if (process.env.ALLOW_PRISMA_UPGRADE !== 'true') {
      process.exit(1);
    } else {
      console.log(`${YELLOW}⚠️  Bypassing Prisma version check (ALLOW_PRISMA_UPGRADE=true)${RESET}`);
    }
  }
}

// Only run during install, not during CI or other automated processes
if (process.env.npm_lifecycle_event === 'preinstall' && !process.env.CI) {
  checkPrismaVersion();
}
