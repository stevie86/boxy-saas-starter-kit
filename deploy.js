#!/usr/bin/env node

/**
 * 🚀 HostelPulse Quick Deploy Script
 * 
 * This script automates the entire Vercel deployment process:
 * 1. Checks if Vercel CLI is installed
 * 2. Builds the project locally to catch errors
 * 3. Deploys to Vercel
 * 4. Prints the demo URL for testing
 */

const { execSync } = require('child_process');
const fs = require('fs');

console.log('🏨 HostelPulse - Quick Deploy to Vercel\n');

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
    const output = execSync(command, { encoding: 'utf8', stdio: 'pipe' });
    log(`✅ ${description} completed`, 'green');
    return output;
  } catch (error) {
    log(`❌ ${description} failed:`, 'red');
    console.error(error.message);
    process.exit(1);
  }
}

async function main() {
  try {
    // Step 1: Check if Vercel CLI is installed
    log('🔍 Checking Vercel CLI installation...', 'blue');
    try {
      execSync('vercel --version', { stdio: 'pipe' });
      log('✅ Vercel CLI is installed', 'green');
    } catch (error) {
      log('❌ Vercel CLI not found. Installing...', 'yellow');
      runCommand('npm install -g vercel', 'Installing Vercel CLI');
    }

    // Step 2: Check if we're in a git repository
    log('\n🔍 Checking git status...', 'blue');
    try {
      const gitStatus = execSync('git status --porcelain', { encoding: 'utf8' });
      if (gitStatus.trim()) {
        log('📝 Uncommitted changes found. Committing...', 'yellow');
        runCommand('git add .', 'Staging changes');
        runCommand('git commit -m "Deploy: Ready for production with complete demo"', 'Committing changes');
      } else {
        log('✅ Git repository is clean', 'green');
      }
    } catch (error) {
      log('⚠️  Not a git repository or git not available', 'yellow');
    }

    // Step 3: Install dependencies
    runCommand('pnpm install', 'Installing dependencies');

    // Step 4: Build the project locally to catch errors
    runCommand('pnpm build:demo', 'Building project locally');

    // Step 5: Deploy to Vercel
    log('\n🚀 Deploying to Vercel...', 'blue');
    const deployOutput = execSync('vercel --prod --yes', { encoding: 'utf8' });
    
    // Extract the deployment URL from Vercel output
    const urlMatch = deployOutput.match(/https:\/\/[^\s]+/);
    const deploymentUrl = urlMatch ? urlMatch[0] : null;

    if (deploymentUrl) {
      log('\n🎉 DEPLOYMENT SUCCESSFUL!', 'green');
      log('═'.repeat(60), 'green');
      
      log(`\n🌐 Your HostelPulse demo is live at:`, 'bold');
      log(`${deploymentUrl}/demo`, 'blue');
      
      log(`\n📱 Share this URL with users to test:`, 'bold');
      log(`${deploymentUrl}/demo`, 'yellow');
      
      log(`\n🎯 Demo Features Available:`, 'bold');
      log(`• Dashboard: ${deploymentUrl}/demo`, 'reset');
      log(`• Rooms: ${deploymentUrl}/demo/rooms`, 'reset');
      log(`• Bookings: ${deploymentUrl}/demo/bookings`, 'reset');
      log(`• New Booking: ${deploymentUrl}/demo/bookings/new`, 'reset');
      log(`• Check-in: ${deploymentUrl}/demo/checkin`, 'reset');
      
      log(`\n💬 Advanced Feedback System:`, 'bold');
      log(`• Floating feedback button on all pages`, 'reset');
      log(`• Star ratings and user comments`, 'reset');
      log(`• Automatic GitHub issue creation`, 'reset');
      log(`• Pushbullet instant notifications`, 'reset');
      log(`• Feedback queuing when services unavailable`, 'reset');
      log(`• User tracking with GitHub issue URLs`, 'reset');
      
      log(`\n⚙️  Optional Integrations:`, 'bold');
      log(`• Setup Pushbullet: node scripts/setup-pushbullet.sh`, 'reset');
      log(`• Setup GitHub: node scripts/setup-github-feedback.js`, 'reset');
      log(`• Process queue: GET ${deploymentUrl}/api/feedback/process-queue`, 'reset');
      
      log('\n═'.repeat(60), 'green');
      log('🚀 Ready for user testing!', 'green');
      
      // Save comprehensive deployment info
      const deploymentInfo = {
        url: `${deploymentUrl}/demo`,
        timestamp: new Date().toISOString(),
        features: [
          'Complete hostel management demo',
          'Advanced feedback system with GitHub integration',
          'Mobile-responsive design',
          'Real-time notifications',
          'Feedback queuing system'
        ],
        endpoints: {
          demo: `${deploymentUrl}/demo`,
          feedback: `${deploymentUrl}/api/feedback`,
          processQueue: `${deploymentUrl}/api/feedback/process-queue`
        }
      };
      
      fs.writeFileSync('DEMO_URL.txt', `${deploymentUrl}/demo`);
      fs.writeFileSync('deployment-info.json', JSON.stringify(deploymentInfo, null, 2));
      
      log('\n📄 Demo URL saved to DEMO_URL.txt', 'blue');
      log('📊 Deployment info saved to deployment-info.json', 'blue');
      
    } else {
      log('⚠️  Deployment completed but URL not found in output', 'yellow');
      console.log('Vercel output:', deployOutput);
    }

  } catch (error) {
    log('\n❌ Deployment failed:', 'red');
    console.error(error.message);
    process.exit(1);
  }
}

main();