#!/usr/bin/env node

/**
 * GitHub Feedback Integration Setup Script
 * 
 * This script helps set up GitHub integration for automatic issue creation from feedback.
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function main() {
  console.log('🐙 GitHub Feedback Integration Setup\n');
  
  console.log('This will help you set up automatic GitHub issue creation from user feedback.\n');
  
  // Step 1: Get GitHub details
  console.log('📋 Step 1: GitHub Repository Information');
  const owner = await question('GitHub username or organization: ');
  const repo = await question('Repository name (e.g., hostelpulse-feedback): ');
  
  console.log('\n🔑 Step 2: GitHub Personal Access Token');
  console.log('You need a GitHub Personal Access Token with "repo" permissions.');
  console.log('Create one at: https://github.com/settings/tokens\n');
  
  const token = await question('GitHub Personal Access Token: ');
  
  console.log('\n🔒 Step 3: Security Token');
  const processToken = await question('Feedback processing token (random string): ') || 
                      Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  
  // Step 4: Update environment files
  console.log('\n📝 Step 4: Updating Environment Configuration...');
  
  const envVars = `
# GitHub Integration for Automatic Issue Creation from Feedback
GITHUB_TOKEN="${token}"
GITHUB_OWNER="${owner}"
GITHUB_REPO="${repo}"
FEEDBACK_PROCESS_TOKEN="${processToken}"
`;

  // Update .env.local
  const envLocalPath = '.env.local';
  let envContent = '';
  
  if (fs.existsSync(envLocalPath)) {
    envContent = fs.readFileSync(envLocalPath, 'utf8');
    
    // Remove existing GitHub vars
    envContent = envContent.replace(/^GITHUB_TOKEN=.*$/gm, '');
    envContent = envContent.replace(/^GITHUB_OWNER=.*$/gm, '');
    envContent = envContent.replace(/^GITHUB_REPO=.*$/gm, '');
    envContent = envContent.replace(/^FEEDBACK_PROCESS_TOKEN=.*$/gm, '');
    
    // Clean up empty lines
    envContent = envContent.replace(/\n\n+/g, '\n\n');
  }
  
  envContent += envVars;
  fs.writeFileSync(envLocalPath, envContent);
  
  console.log('✅ Environment variables updated in .env.local');
  
  // Step 5: Test the integration
  console.log('\n🧪 Step 5: Testing GitHub Integration...');
  
  try {
    const testResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github.v3+json',
      }
    });
    
    if (testResponse.ok) {
      console.log('✅ GitHub repository access confirmed');
    } else if (testResponse.status === 404) {
      console.log('⚠️  Repository not found. Make sure it exists and the token has access.');
      
      const createRepo = await question('\nWould you like to create the repository? (y/n): ');
      if (createRepo.toLowerCase() === 'y') {
        const createResponse = await fetch('https://api.github.com/user/repos', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/vnd.github.v3+json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: repo,
            description: 'HostelPulse user feedback and feature requests',
            private: false,
            has_issues: true,
            has_projects: false,
            has_wiki: false,
          })
        });
        
        if (createResponse.ok) {
          console.log('✅ Repository created successfully');
        } else {
          console.log('❌ Failed to create repository');
        }
      }
    } else {
      console.log('❌ GitHub API error:', testResponse.status);
    }
  } catch (error) {
    console.log('❌ Network error testing GitHub:', error.message);
  }
  
  // Step 6: Instructions
  console.log('\n🎉 Setup Complete!');
  console.log('═'.repeat(50));
  console.log('\n📋 What happens now:');
  console.log('• User feedback will automatically create GitHub issues');
  console.log('• Users get notified when their feedback is forwarded');
  console.log('• Issues include rating, message, and user details');
  console.log('• Feedback is queued if GitHub is temporarily unavailable');
  
  console.log('\n🔗 Your feedback repository:');
  console.log(`https://github.com/${owner}/${repo}`);
  
  console.log('\n⚡ Process queued feedback manually:');
  console.log(`curl -X POST -H "Authorization: Bearer ${processToken}" \\`);
  console.log(`  https://your-domain.com/api/feedback/process-queue`);
  
  console.log('\n📊 Check queue status:');
  console.log('GET https://your-domain.com/api/feedback/process-queue');
  
  rl.close();
}

main().catch(console.error);