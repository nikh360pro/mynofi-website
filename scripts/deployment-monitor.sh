#!/bin/bash

# Mynofi Website Deployment Monitoring Script
# This script monitors deployment status and sends alerts if needed

set -e

echo "📊 Starting Mynofi Deployment Monitoring..."

# Configuration
SITE_URL=${1:-"https://mynofi.com"}
WEBHOOK_URL=${2:-""}  # Optional webhook for notifications
CHECK_INTERVAL=${3:-300}  # 5 minutes default
MAX_FAILURES=${4:-3}  # Max consecutive failures before alert

# State file for tracking failures
STATE_FILE="/tmp/mynofi-deployment-monitor.state"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
log_info() {
    echo -e "${GREEN}✅ $(date): $1${NC}"
}

log_warn() {
    echo -e "${YELLOW}⚠️  $(date): $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $(date): $1${NC}"
}

log_status() {
    echo -e "${BLUE}📊 $(date): $1${NC}"
}

# Function to get current failure count
get_failure_count() {
    if [ -f "$STATE_FILE" ]; then
        cat "$STATE_FILE" 2>/dev/null || echo "0"
    else
        echo "0"
    fi
}

# Function to set failure count
set_failure_count() {
    echo "$1" > "$STATE_FILE"
}

# Function to send notification
send_notification() {
    local message="$1"
    local severity="$2"
    
    log_status "Sending notification: $message"
    
    if [ -n "$WEBHOOK_URL" ]; then
        # Send to webhook (Slack, Discord, etc.)
        curl -s -X POST "$WEBHOOK_URL" \
            -H "Content-Type: application/json" \
            -d "{\"text\": \"🚨 Mynofi Deployment Alert ($severity): $message\"}" \
            >/dev/null 2>&1 || log_warn "Failed to send webhook notification"
    fi
    
    # Log to system logger if available
    if command -v logger >/dev/null 2>&1; then
        logger -t "mynofi-monitor" "$severity: $message"
    fi
}

# Function to check deployment health
check_deployment() {
    local url="$1"
    local failure_count=$(get_failure_count)
    
    log_status "Checking deployment health for: $url"
    
    # Run health check
    if ./scripts/health-check.sh "$url" >/dev/null 2>&1; then
        if [ "$failure_count" -gt 0 ]; then
            log_info "Deployment recovered after $failure_count failures"
            send_notification "Deployment recovered successfully" "INFO"
            set_failure_count 0
        else
            log_info "Deployment is healthy"
        fi
        return 0
    else
        failure_count=$((failure_count + 1))
        log_error "Deployment health check failed (failure $failure_count/$MAX_FAILURES)"
        set_failure_count "$failure_count"
        
        if [ "$failure_count" -ge "$MAX_FAILURES" ]; then
            log_error "Maximum failures reached, sending critical alert"
            send_notification "Deployment has failed $failure_count consecutive times" "CRITICAL"
            return 1
        else
            log_warn "Deployment failing, will alert after $MAX_FAILURES failures"
            return 1
        fi
    fi
}

# Function to monitor GitHub Actions
check_github_actions() {
    log_status "Checking GitHub Actions status..."
    
    # This would require GitHub CLI or API access
    # For now, just log that we're checking
    log_info "GitHub Actions monitoring would require additional setup"
}

# Function to check Netlify deployment status
check_netlify_status() {
    log_status "Checking Netlify deployment status..."
    
    # This would require Netlify CLI authentication
    # For now, just log that we're checking
    log_info "Netlify status monitoring would require CLI authentication"
}

# Function to generate monitoring report
generate_report() {
    local failure_count=$(get_failure_count)
    
    cat << EOF

📊 MYNOFI DEPLOYMENT MONITORING REPORT
=====================================
Date: $(date)
Site URL: $SITE_URL
Check Interval: ${CHECK_INTERVAL}s
Max Failures: $MAX_FAILURES
Current Failures: $failure_count

Status: $([ "$failure_count" -eq 0 ] && echo "✅ HEALTHY" || echo "⚠️  WARNING ($failure_count failures)")

Last Check Results:
$(./scripts/health-check.sh "$SITE_URL" 2>&1 | tail -10)

EOF
}

# Main monitoring loop
run_monitoring() {
    log_status "Starting continuous monitoring (interval: ${CHECK_INTERVAL}s)"
    
    while true; do
        check_deployment "$SITE_URL"
        
        # Optional: Check other services
        # check_github_actions
        # check_netlify_status
        
        log_status "Waiting ${CHECK_INTERVAL}s until next check..."
        sleep "$CHECK_INTERVAL"
    done
}

# Function to run single check
run_single_check() {
    log_status "Running single deployment check..."
    
    if check_deployment "$SITE_URL"; then
        log_info "Single check completed successfully"
        generate_report
        exit 0
    else
        log_error "Single check failed"
        generate_report
        exit 1
    fi
}

# Main execution
main() {
    echo "📊 Mynofi Deployment Monitor"
    echo "============================"
    echo ""
    
    # Check if health check script exists
    if [ ! -f "./scripts/health-check.sh" ]; then
        log_error "Health check script not found at ./scripts/health-check.sh"
        exit 1
    fi
    
    # Make sure health check script is executable
    chmod +x ./scripts/health-check.sh
    
    case "${5:-single}" in
        "continuous")
            log_status "Running in continuous monitoring mode"
            run_monitoring
            ;;
        "single")
            run_single_check
            ;;
        "report")
            generate_report
            ;;
        *)
            echo "Usage: $0 [site_url] [webhook_url] [interval_seconds] [max_failures] [mode]"
            echo ""
            echo "Parameters:"
            echo "  site_url         Website URL to monitor (default: https://mynofi.com)"
            echo "  webhook_url      Optional webhook URL for notifications"
            echo "  interval_seconds Check interval in seconds (default: 300)"
            echo "  max_failures     Max consecutive failures before alert (default: 3)"
            echo "  mode            'single', 'continuous', or 'report' (default: single)"
            echo ""
            echo "Examples:"
            echo "  $0                                           # Single check with defaults"
            echo "  $0 https://mynofi.com '' 60 5 continuous    # Continuous monitoring"
            echo "  $0 https://mynofi.com '' '' '' report       # Generate report only"
            echo ""
            exit 1
            ;;
    esac
}

# Execute main function with all arguments
main "$@"