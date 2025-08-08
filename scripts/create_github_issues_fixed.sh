#!/bin/bash

# GitHub Issues Creation Script for CodeRecall CLI
# This script creates all planned issues in your GitHub repository

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
REPO_OWNER="jessaimaya"
REPO_NAME="code-recall"

echo -e "${BLUE}Creating GitHub Issues for CodeRecall CLI${NC}"
echo -e "${YELLOW}Repository: ${REPO_OWNER}/${REPO_NAME}${NC}"
echo ""

# Check if gh CLI is installed and authenticated
if ! command -v gh &> /dev/null; then
    echo -e "${RED}Error: GitHub CLI (gh) is not installed${NC}"
    echo "Install it from: https://cli.github.com/"
    exit 1
fi

# Test authentication
if ! gh auth status &> /dev/null; then
    echo -e "${RED}Error: Not authenticated with GitHub CLI${NC}"
    echo "Run: gh auth login"
    exit 1
fi

echo -e "${GREEN}✓ GitHub CLI is installed and authenticated${NC}"
echo ""

# First, create all the labels we'll need
echo -e "${YELLOW}=== Creating Labels ===${NC}"

labels=(
    "setup:Setup and configuration tasks:#0052CC"
    "cli:Command line interface:#5319E7"
    "database:Database related:#B60205"
    "config:Configuration management:#1D76DB"
    "core:Core functionality:#0E8A16"
    "algorithm:Algorithm implementation:#FBCA04"
    "editor:Editor integration:#F9D0C4"
    "stats:Statistics and analytics:#C2E0C6"
    "import:Import functionality:#BFD4F2"
    "backup:Backup and restore:#FEF2C0"
    "filesystem:File system operations:#D93F0B"
    "cross-platform:Cross platform support:#0366D6"
    "sync:Synchronization:#7057FF"
    "github:GitHub integration:#000000"
    "notifications:Notifications:#D4C5F9"
    "conflict-resolution:Conflict resolution:#E99695"
    "s3:AWS S3 integration:#FF9500"
    "testing:Testing:#1B1F23"
    "unit-tests:Unit testing:#D1F2EB"
    "integration-tests:Integration testing:#FFF5B4"
    "performance:Performance optimization:#F1C40F"
    "optimization:Code optimization:#FF6B6B"
    "documentation:Documentation:#0075CA"
    "examples:Examples and tutorials:#BFE5BF"
    "high-priority:High priority:#B60205"
    "medium-priority:Medium priority:#FBCA04"
    "low-priority:Low priority:#0E8A16"
    "epic:foundation:Foundation epic:#5319E7"
    "epic:core:Core functionality epic:#0E8A16"
    "epic:data:Data management epic:#1D76DB"
    "epic:sync:Sync and notifications epic:#7057FF"
    "epic:testing:Testing and quality epic:#1B1F23"
    "enhancement:Feature enhancement:#84B6EB"
)

for label_info in "${labels[@]}"; do
    IFS=':' read -r name description color <<< "$label_info"
    echo -e "${BLUE}Creating label: ${name}${NC}"
    
    # Try to create the label, ignore errors if it already exists
    gh label create "$name" --description "$description" --color "$color" --repo "${REPO_OWNER}/${REPO_NAME}" 2>/dev/null || true
done

echo -e "${GREEN}✓ Labels created${NC}"
echo ""

# Function to create an issue
create_issue() {
    local title="$1"
    local body="$2"
    local labels="$3"
    
    echo -e "${BLUE}Creating issue: ${title}${NC}"
    
    # Create the issue without labels first, then add labels
    local issue_url=$(gh issue create \
        --repo "${REPO_OWNER}/${REPO_NAME}" \
        --title "$title" \
        --body "$body")
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Created: ${issue_url}${NC}"
        
        # Add labels to the created issue
        if [ -n "$labels" ]; then
            issue_number=$(echo "$issue_url" | grep -o '[0-9]\+$')
            gh issue edit "$issue_number" --add-label "$labels" --repo "${REPO_OWNER}/${REPO_NAME}" 2>/dev/null || true
        fi
    else
        echo -e "${RED}✗ Failed to create issue: ${title}${NC}"
        return 1
    fi
    
    # Small delay to avoid rate limiting
    sleep 1
}

# Epic 1: Project Foundation & Setup
echo -e "${YELLOW}=== Creating Epic 1: Foundation Issues ===${NC}"

create_issue "Project Setup and Cargo Configuration" \
"Set up the basic Rust project structure with all necessary dependencies and configuration files.

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
High" \
"setup,high-priority,epic:foundation"

create_issue "CLI Framework and Argument Parsing" \
"Implement the complete CLI interface using clap with all commands and subcommands defined in the architecture.

## Acceptance Criteria
- [ ] All main commands implemented (review, add, sync, backup, etc.)
- [ ] Global options work (--data-dir, --config, --quiet)
- [ ] Help text is comprehensive and user-friendly
- [ ] Shell completion generation works
- [ ] Input validation for all arguments

## Tasks
- Create CLI structure with clap derive macros
- Implement argument parsing for all commands
- Add help text and examples for each command
- Set up shell completion generation
- Add input validation and error handling

## Epic
Foundation & Setup

## Priority
High" \
"cli,high-priority,epic:foundation"

create_issue "Database Schema and Migrations" \
"Implement SQLite database schema with proper migrations and initial setup.

## Acceptance Criteria
- [ ] All tables created as per architecture (challenges, progress, reviews, etc.)
- [ ] Database migrations system in place
- [ ] Connection pooling and WAL mode configured
- [ ] Indexes created for performance
- [ ] Database initialization on first run

## Tasks
- Create SQL schema files
- Implement database migration system
- Set up rusqlite with proper configuration
- Add database initialization logic
- Create database utility functions

## Epic
Foundation & Setup

## Priority
High" \
"database,high-priority,epic:foundation"

create_issue "Configuration Management System" \
"Implement TOML-based configuration with environment variable overrides and default settings.

## Acceptance Criteria
- [ ] TOML config file parsing works
- [ ] Environment variable overrides function
- [ ] Default configuration is sensible
- [ ] Config validation and error handling
- [ ] \`coderecall config\` command works

## Tasks
- Create configuration structs with serde
- Implement config file reading/writing
- Add environment variable support
- Create config command for CLI
- Add configuration validation

## Epic
Foundation & Setup

## Priority
Medium" \
"config,medium-priority,epic:foundation"

# Epic 2: Core Functionality
echo -e "${YELLOW}=== Creating Epic 2: Core Functionality Issues ===${NC}"

create_issue "Challenge Parsing and Validation" \
"Implement Markdown challenge parsing with YAML frontmatter validation and content hashing.

## Acceptance Criteria
- [ ] Parse YAML frontmatter correctly
- [ ] Extract and validate all required fields
- [ ] Generate SHA-256 content hashes
- [ ] Handle malformed challenge files gracefully
- [ ] Support challenge file validation

## Tasks
- Implement Challenge struct with serde
- Add YAML frontmatter parsing
- Create content hashing utilities
- Add challenge validation logic
- Handle parsing errors gracefully

## Epic
Core Functionality

## Priority
High" \
"core,high-priority,epic:core"

create_issue "FSRS Spaced Repetition Algorithm" \
"Implement the FSRS (Free Spaced Repetition Scheduler) algorithm with SM-2 fallback for scheduling reviews.

## Acceptance Criteria
- [ ] FSRS algorithm correctly calculates next review dates
- [ ] SM-2 compatibility mode works
- [ ] Handle all review ratings (Again, Hard, Good, Easy)
- [ ] Progress tracking updates correctly
- [ ] Algorithm parameters are configurable

## Tasks
- Implement FSRS mathematical formulas
- Create Progress struct and update logic
- Add review rating system
- Implement scheduling calculations
- Add algorithm configuration options

## Epic
Core Functionality

## Priority
High" \
"algorithm,high-priority,epic:core"

create_issue "Challenge Database Operations" \
"Implement all CRUD operations for challenges and progress tracking in SQLite.

## Acceptance Criteria
- [ ] Add/update/delete challenges in database
- [ ] Query challenges by various filters (tags, due date, etc.)
- [ ] Progress tracking CRUD operations
- [ ] Review history recording
- [ ] Efficient queries with proper indexing

## Tasks
- Implement challenge database operations
- Add progress tracking functions
- Create review history recording
- Add database query utilities
- Optimize with proper indexes

## Epic
Core Functionality

## Priority
High" \
"database,core,high-priority,epic:core"

create_issue "Review Command and Editor Integration" \
"Implement the review command that opens due challenges in the user's preferred editor and updates progress.

## Acceptance Criteria
- [ ] Detect user's preferred editor automatically
- [ ] Open challenge files in editor
- [ ] Collect user ratings after review
- [ ] Update progress and schedule next review
- [ ] Handle multiple due challenges

## Tasks
- Implement editor detection logic
- Add file opening functionality
- Create review rating interface
- Update progress after reviews
- Handle batch review workflows

## Epic
Core Functionality

## Priority
High" \
"cli,editor,high-priority,epic:core"

create_issue "Statistics and Progress Tracking" \
"Implement statistics dashboard showing learning progress, streaks, and due challenge counts.

## Acceptance Criteria
- [ ] Show overall progress statistics
- [ ] Display learning streaks
- [ ] Count due/overdue challenges
- [ ] Show mastery levels by tag/pattern
- [ ] Support both table and JSON output

## Tasks
- Implement statistics calculation functions
- Create stats command output formatting
- Add progress visualization
- Calculate learning metrics
- Support multiple output formats

## Epic
Core Functionality

## Priority
Medium" \
"stats,cli,medium-priority,epic:core"

# Epic 3: Data Management
echo -e "${YELLOW}=== Creating Epic 3: Data Management Issues ===${NC}"

create_issue "Challenge Import System" \
"Implement challenge import from various sources (files, directories, GitHub repos, ZIP archives).

## Acceptance Criteria
- [ ] Import single challenge files
- [ ] Import entire directories of challenges
- [ ] Import from GitHub repositories
- [ ] Import from ZIP archives
- [ ] Duplicate detection and handling

## Tasks
- Create file import functionality
- Add directory traversal for bulk import
- Implement GitHub repo import
- Add ZIP archive extraction
- Handle duplicate challenges

## Epic
Data Management

## Priority
Medium" \
"import,medium-priority,epic:data"

create_issue "Backup and Restore System" \
"Implement database backup/restore and full export/import functionality.

## Acceptance Criteria
- [ ] Database-only backup/restore works
- [ ] Full ZIP export includes all data
- [ ] Import from ZIP restores everything
- [ ] Backup validation and integrity checks
- [ ] Incremental backup support

## Tasks
- Implement SQLite backup using VACUUM INTO
- Create ZIP export/import functionality
- Add backup validation
- Handle restore confirmations
- Create incremental backup logic

## Epic
Data Management

## Priority
Medium" \
"backup,medium-priority,epic:data"

create_issue "Cross-Platform File Operations" \
"Ensure all file operations work correctly across Windows, macOS, and Linux.

## Acceptance Criteria
- [ ] Path handling works on all platforms
- [ ] File permissions handled correctly
- [ ] Directory creation and management
- [ ] Temporary file handling
- [ ] Case-sensitivity considerations

## Tasks
- Implement cross-platform path utilities
- Add file permission checking
- Create directory management functions
- Handle temporary files properly
- Test on all target platforms

## Epic
Data Management

## Priority
Medium" \
"filesystem,cross-platform,medium-priority,epic:data"

# Epic 4: Sync and Notifications
echo -e "${YELLOW}=== Creating Epic 4: Sync & Notifications Issues ===${NC}"

create_issue "GitHub Sync Provider" \
"Implement GitHub repository sync for challenges and progress data.

## Acceptance Criteria
- [ ] Push challenges to GitHub repo
- [ ] Pull challenges from GitHub repo
- [ ] Sync progress data as JSON
- [ ] Handle authentication via tokens
- [ ] Conflict resolution works

## Tasks
- Implement GitHub API integration
- Create sync provider trait
- Add authentication handling
- Implement push/pull logic
- Add conflict resolution

## Epic
Sync & Notifications

## Priority
Medium" \
"sync,github,medium-priority,epic:sync"

create_issue "Cross-Platform Notifications" \
"Implement native desktop notifications for review reminders.

## Acceptance Criteria
- [ ] Windows notifications work
- [ ] macOS notifications work
- [ ] Linux notifications work
- [ ] Configurable reminder times
- [ ] Rich notification content

## Tasks
- Implement Windows notification system
- Add macOS notification support
- Create Linux notification handling
- Add notification scheduling
- Create rich notification content

## Epic
Sync & Notifications

## Priority
Low" \
"notifications,cross-platform,low-priority,epic:sync"

create_issue "Sync Conflict Resolution" \
"Implement intelligent conflict resolution for sync operations.

## Acceptance Criteria
- [ ] Detect sync conflicts automatically
- [ ] Resolve challenge conflicts by content hash
- [ ] Merge progress data intelligently
- [ ] User prompts for manual resolution
- [ ] Conflict logging and reporting

## Tasks
- Create conflict detection logic
- Implement automatic resolution strategies
- Add manual resolution prompts
- Create conflict logging system
- Test various conflict scenarios

## Epic
Sync & Notifications

## Priority
Medium" \
"sync,conflict-resolution,medium-priority,epic:sync"

create_issue "S3 Sync Provider (Optional)" \
"Implement S3 bucket sync as an alternative to GitHub.

## Acceptance Criteria
- [ ] Upload challenges to S3 bucket
- [ ] Download challenges from S3 bucket
- [ ] Handle AWS credentials
- [ ] Sync progress data
- [ ] Cross-region support

## Tasks
- Integrate AWS SDK for Rust
- Implement S3 sync provider
- Add credential management
- Create bucket operations
- Handle regional configurations

## Epic
Sync & Notifications

## Priority
Low" \
"sync,s3,low-priority,epic:sync,enhancement"

# Epic 5: Testing and Quality
echo -e "${YELLOW}=== Creating Epic 5: Testing & Quality Issues ===${NC}"

create_issue "Unit Testing Suite" \
"Comprehensive unit tests for all core functionality.

## Acceptance Criteria
- [ ] 90%+ code coverage for core modules
- [ ] FSRS algorithm thoroughly tested
- [ ] Database operations tested
- [ ] Edge cases covered
- [ ] Performance regression tests

## Tasks
- Write tests for all core modules
- Create FSRS algorithm test suite
- Add database operation tests
- Test edge cases and error conditions
- Set up coverage reporting

## Epic
Testing & Quality

## Priority
Medium" \
"testing,unit-tests,medium-priority,epic:testing"

create_issue "Integration Testing" \
"End-to-end integration tests for CLI commands and workflows.

## Acceptance Criteria
- [ ] All CLI commands tested end-to-end
- [ ] Full review workflow tested
- [ ] Sync operations tested
- [ ] Backup/restore workflows tested
- [ ] Cross-platform testing

## Tasks
- Create CLI command integration tests
- Test complete user workflows
- Add sync provider integration tests
- Test backup/restore operations
- Set up cross-platform CI testing

## Epic
Testing & Quality

## Priority
Medium" \
"testing,integration-tests,medium-priority,epic:testing"

create_issue "Performance Optimization" \
"Optimize performance for large challenge libraries and long review histories.

## Acceptance Criteria
- [ ] Database queries optimized
- [ ] Memory usage minimized
- [ ] Startup time under 100ms
- [ ] Large file handling efficient
- [ ] Benchmark suite in place

## Tasks
- Profile application performance
- Optimize database queries
- Reduce memory allocations
- Improve file I/O performance
- Create benchmark suite

## Epic
Testing & Quality

## Priority
Low" \
"performance,optimization,low-priority,epic:testing"

create_issue "Documentation and Examples" \
"Complete documentation with examples and tutorials.

## Acceptance Criteria
- [ ] README with quick start guide
- [ ] Complete CLI reference
- [ ] Challenge format documentation
- [ ] Sync setup tutorials
- [ ] Example challenge library

## Tasks
- Write comprehensive README
- Create CLI command documentation
- Document challenge format specification
- Create sync setup guides
- Build example challenge library

## Epic
Testing & Quality

## Priority
Low" \
"documentation,examples,low-priority,epic:testing"

echo ""
echo -e "${GREEN}✅ All GitHub issues have been created successfully!${NC}"
echo -e "${BLUE}Next steps:${NC}"
echo "1. Go to your GitHub repository: https://github.com/${REPO_OWNER}/${REPO_NAME}"
echo "2. Navigate to Issues tab to see all created issues"
echo "3. Create milestones (v0.1.0, v0.2.0, etc.) and assign issues"
echo "4. Set up GitHub Projects board and move issues to appropriate columns"
echo ""
echo -e "${YELLOW}Happy coding! 🚀${NC}"