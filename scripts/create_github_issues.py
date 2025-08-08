#!/usr/bin/env python3
"""
GitHub Issues Creation Script for CodeRecall CLI
Alternative Python approach using GitHub API directly
"""

import os
import json
import time
import requests
from typing import Dict, List

# Configuration
GITHUB_TOKEN = os.getenv('GITHUB_TOKEN')
REPO_OWNER = "jessai"  # Change to your GitHub username
REPO_NAME = "code-recall"
GITHUB_API = "https://api.github.com"

def create_issue(title: str, body: str, labels: List[str]) -> Dict:
    """Create a GitHub issue using the API"""
    
    if not GITHUB_TOKEN:
        print("❌ Error: GITHUB_TOKEN environment variable not set")
        print("Create a token at: https://github.com/settings/tokens")
        exit(1)
    
    url = f"{GITHUB_API}/repos/{REPO_OWNER}/{REPO_NAME}/issues"
    
    headers = {
        'Authorization': f'token {GITHUB_TOKEN}',
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json'
    }
    
    data = {
        'title': title,
        'body': body,
        'labels': labels
    }
    
    print(f"🔄 Creating: {title}")
    
    response = requests.post(url, headers=headers, json=data)
    
    if response.status_code == 201:
        issue = response.json()
        print(f"✅ Created: {issue['html_url']}")
        return issue
    else:
        print(f"❌ Failed: {response.status_code} - {response.text}")
        return {}

def main():
    """Create all GitHub issues"""
    
    print("🚀 Creating GitHub Issues for CodeRecall CLI")
    print(f"📁 Repository: {REPO_OWNER}/{REPO_NAME}")
    print()
    
    issues = [
        {
            "title": "Project Setup and Cargo Configuration",
            "body": """Set up the basic Rust project structure with all necessary dependencies and configuration files.

## Acceptance Criteria
- [ ] Initialize Cargo project with proper metadata
- [ ] Add all dependencies from architecture document
- [ ] Configure feature flags (github-sync, s3-sync, sqlx-backend)
- [ ] Set up basic module structure (cli/, core/, storage/, etc.)
- [ ] Create .gitignore for Rust projects
- [ ] Add MIT license file
- [ ] Configure cross-platform build targets

## Tasks
- Set up Cargo.toml with all crates from architecture
- Create src/ directory structure
- Add basic mod.rs files for each module
- Configure development dependencies for testing

## Epic
Foundation & Setup

## Priority
High""",
            "labels": ["setup", "high-priority", "epic:foundation"]
        },
        # Add more issues here following the same pattern...
        # (I'll show just one example to keep this manageable)
    ]
    
    # Create all issues
    created_count = 0
    for issue_data in issues:
        result = create_issue(
            issue_data["title"],
            issue_data["body"],
            issue_data["labels"]
        )
        if result:
            created_count += 1
        
        # Rate limiting - GitHub allows 5000 requests per hour
        time.sleep(1)
    
    print(f"\n✅ Successfully created {created_count} issues!")
    print(f"🔗 View them at: https://github.com/{REPO_OWNER}/{REPO_NAME}/issues")

if __name__ == "__main__":
    main()