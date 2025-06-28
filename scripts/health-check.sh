#!/bin/bash

# Mynofi Website Deployment Health Check Script
# This script verifies that the website is properly deployed and functioning

set -e

echo "🔍 Starting Mynofi Website Health Check..."

# Configuration
SITE_URL=${1:-"https://mynofi.com"}  # Default to production, override with parameter
TIMEOUT=30
MAX_RETRIES=3

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Helper functions
log_info() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warn() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Function to check HTTP status
check_http_status() {
    local url=$1
    local expected_status=${2:-200}
    
    echo "🌐 Checking HTTP status for: $url"
    
    local status=$(curl -s -o /dev/null -w "%{http_code}" --max-time $TIMEOUT "$url" || echo "000")
    
    if [ "$status" = "$expected_status" ]; then
        log_info "HTTP Status: $status (Expected: $expected_status)"
        return 0
    else
        log_error "HTTP Status: $status (Expected: $expected_status)"
        return 1
    fi
}

# Function to check cache headers
check_cache_headers() {
    local url=$1
    
    echo "🔍 Checking cache headers for: $url"
    
    local headers=$(curl -s -I --max-time $TIMEOUT "$url" 2>/dev/null || echo "")
    
    if echo "$headers" | grep -qi "cache-control.*no-cache"; then
        log_info "HTML cache headers correctly set to no-cache"
    else
        log_warn "HTML cache headers may not be optimal for deployment updates"
    fi
    
    if echo "$headers" | grep -qi "pragma.*no-cache"; then
        log_info "Pragma no-cache header found"
    fi
}

# Function to check for cache-busting implementation
check_cache_busting() {
    local url=$1
    
    echo "🔍 Checking cache-busting implementation..."
    
    local content=$(curl -s --max-time $TIMEOUT "$url" 2>/dev/null || echo "")
    
    if echo "$content" | grep -q "cache-bust"; then
        log_info "Cache-busting meta tag found"
    else
        log_warn "Cache-busting meta tag not found"
    fi
    
    if echo "$content" | grep -q "v=20250628"; then
        log_info "Asset versioning found"
    else
        log_warn "Asset versioning not detected"
    fi
}

# Function to check asset availability
check_assets() {
    local base_url=$1
    
    echo "🔍 Checking critical assets..."
    
    # Check main JavaScript file
    if check_http_status "$base_url/assets/index-BfMtTUO6.js?v=20250628"; then
        log_info "Main JavaScript asset available"
    else
        log_error "Main JavaScript asset not accessible"
    fi
    
    # Check main CSS file
    if check_http_status "$base_url/assets/index-C5vGUCjV.css?v=20250628"; then
        log_info "Main CSS asset available"
    else
        log_error "Main CSS asset not accessible"
    fi
    
    # Check favicon
    if check_http_status "$base_url/favicon.ico"; then
        log_info "Favicon available"
    else
        log_warn "Favicon not accessible"
    fi
}

# Function to check page content
check_content() {
    local url=$1
    
    echo "🔍 Checking page content..."
    
    local content=$(curl -s --max-time $TIMEOUT "$url" 2>/dev/null || echo "")
    
    if echo "$content" | grep -q "Mynofi"; then
        log_info "Mynofi branding found in content"
    else
        log_error "Mynofi branding not found - may be serving old content"
    fi
    
    if echo "$content" | grep -q "Software Monitoring Tool"; then
        log_info "Updated page title found"
    else
        log_warn "Page title may not be updated"
    fi
    
    if echo "$content" | grep -q "root"; then
        log_info "React root element found"
    else
        log_error "React root element not found"
    fi
}

# Function to check Supabase connectivity (if applicable)
check_supabase() {
    local url=$1
    
    echo "🔍 Checking Supabase integration..."
    
    local content=$(curl -s --max-time $TIMEOUT "$url" 2>/dev/null || echo "")
    
    if echo "$content" | grep -q "supabase"; then
        log_info "Supabase integration detected"
    else
        log_warn "Supabase integration not explicitly found"
    fi
}

# Main health check function
run_health_check() {
    local url=$1
    local retry_count=0
    
    echo "🚀 Running health check for: $url"
    echo "⏱️  Timeout: ${TIMEOUT}s, Max retries: ${MAX_RETRIES}"
    echo ""
    
    while [ $retry_count -lt $MAX_RETRIES ]; do
        echo "📝 Attempt $((retry_count + 1)) of $MAX_RETRIES"
        
        # Core checks
        if check_http_status "$url" && \
           check_cache_headers "$url" && \
           check_cache_busting "$url" && \
           check_content "$url"; then
            
            # Additional checks
            check_assets "$url"
            check_supabase "$url"
            
            echo ""
            log_info "🎉 Health check completed successfully!"
            log_info "Website is properly deployed and functioning"
            return 0
        fi
        
        retry_count=$((retry_count + 1))
        if [ $retry_count -lt $MAX_RETRIES ]; then
            echo ""
            log_warn "Health check failed, retrying in 10 seconds..."
            sleep 10
        fi
    done
    
    echo ""
    log_error "🚨 Health check failed after $MAX_RETRIES attempts"
    log_error "Website may not be properly deployed or functioning"
    return 1
}

# Performance check function
check_performance() {
    local url=$1
    
    echo "⚡ Running performance check..."
    
    local start_time=$(date +%s%N)
    curl -s -o /dev/null --max-time $TIMEOUT "$url" >/dev/null 2>&1
    local end_time=$(date +%s%N)
    
    local response_time=$(( (end_time - start_time) / 1000000 ))
    
    echo "📊 Response time: ${response_time}ms"
    
    if [ $response_time -lt 2000 ]; then
        log_info "Response time is good (< 2s)"
    elif [ $response_time -lt 5000 ]; then
        log_warn "Response time is acceptable (< 5s)"
    else
        log_warn "Response time is slow (> 5s)"
    fi
}

# Main execution
main() {
    echo "🔍 Mynofi Website Health Check"
    echo "=============================="
    echo ""
    
    if [ -z "$1" ]; then
        echo "Usage: $0 <website_url> [--performance]"
        echo "Example: $0 https://mynofi.com"
        echo "Example: $0 https://deploy-preview-123--mynofi.netlify.app --performance"
        echo ""
        echo "Using default URL: $SITE_URL"
    fi
    
    # Run main health check
    if run_health_check "$SITE_URL"; then
        # Run performance check if requested
        if [ "$2" = "--performance" ]; then
            echo ""
            check_performance "$SITE_URL"
        fi
        
        echo ""
        log_info "🎯 All checks completed successfully!"
        exit 0
    else
        echo ""
        log_error "💥 Health check failed!"
        exit 1
    fi
}

# Execute main function with all arguments
main "$@"