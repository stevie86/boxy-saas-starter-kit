#!/usr/bin/env node

/**
 * 🚀 HostelPulse Quick Deploy
 * 
 * Simple deployment script that gets your demo live immediately
 */

const { execSync } = require('child_process');

console.log('🏨 HostelPulse - Quick Deploy\n');

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function runCommand(command, description) {
  try {
    log(`\n📋 ${description}...`, 'blue');
    execSync(command, { stdio: 'inherit' });
    log(`✅ ${description} completed`, 'green');
  } catch (error) {
    log(`❌ ${description} failed`, 'red');
    process.exit(1);
  }
}

async function main() {
  try {
    log('🚀 Starting deployment...', 'bold');
    
    // Step 1: Install dependencies
    runCommand('pnpm install', 'Installing dependencies');
    
    // Step 2: Build the project
    runCommand('pnpm build:demo', 'Building project');
    
    // Step 3: Deploy to Vercel
    log('\n🌐 Deploying to Vercel...', 'blue');
    const deployOutput = execSync('vercel --prod --yes', { encoding: 'utf8' });
    
    // Extract URL
    const urlMatch = deployOutput.match(/https:\/\/[^\s]+/);
    const deploymentUrl = urlMatch ? urlMatch[0] : null;

    if (deploymentUrl) {
      log('\n🎉 DEPLOYMENT SUCCESSFUL!', 'green');
      log('═'.repeat(50), 'green');
      
      log(`\n🌐 Your HostelPulse demo is live:`, 'bold');
      log(`${deploymentUrl}/demo`, 'blue');
      
      log(`\n📱 Share this URL:`, 'bold');
      log(`${deploymentUrl}/demo`, 'yellow');
      
      log(`\n🎯 Features:`, 'bold');
      log(`• Complete hostel management demo`, 'reset');
      log(`• Mobile-responsive design`, 'reset');
      log(`• Professional feedback system`, 'reset');
      log(`• User tracking pages`, 'reset');
      
      log('\n═'.repeat(50), 'green');
      log('🚀 Ready for users!', 'green');
      
      // Save URL
      require('fs').writeFileSync('DEMO_URL.txt', `${deploymentUrl}/demo`);
      log('\n📄 Demo URL saved to DEMO_URL.txt', 'blue');
      
    } else {
      log('⚠️  Deployment completed but URL not found', 'yellow');
    }

  } catch (error) {
    log('\n❌ Deployment failed:', 'red');
    console.error(error.message);
    process.exit(1);
  }
}

main();