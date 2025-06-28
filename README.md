# Mynofi Website

## Deployment Instructions

This is a pre-built static site. No build step is required.

### Important Notes for Netlify Deployment:

1. This directory contains pre-built files, so no build step is needed
2. The publish directory should be set to `.` (the root of this directory)
3. Do not override these settings in the Netlify UI

### Deploy Steps:

1. Upload this entire directory to Netlify
2. Ensure the Netlify build settings are:
   - Build command: `echo 'No build needed'` (or leave empty)
   - Publish directory: `.` (the current directory, not "dist")
3. Deploy!

If you run into issues with Netlify looking for a "dist" directory, please check your site settings in the Netlify dashboard and make sure the publish directory is set to `.` and not "dist". 