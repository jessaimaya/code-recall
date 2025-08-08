#!/bin/bash

# Script to add all issues to a GitHub Project
# First, you need to find your project ID

REPO_OWNER="jessaimaya"
REPO_NAME="code-recall"

echo "Finding your GitHub Projects..."

# List all projects in your account
gh project list --owner $REPO_OWNER

echo ""
echo "To add issues to your project:"
echo "1. Copy the project number from above"
echo "2. Run these commands:"
echo ""

# Show example commands for adding issues
for i in {1..20}; do
    echo "gh project item-add PROJECT_NUMBER --owner $REPO_OWNER --url https://github.com/$REPO_OWNER/$REPO_NAME/issues/$i"
done

echo ""
echo "Replace PROJECT_NUMBER with your actual project number from the list above"