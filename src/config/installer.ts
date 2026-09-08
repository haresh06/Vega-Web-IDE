/**
 * ============================================================================
 * VEGA Lab Compiler Installer Configuration
 * ============================================================================
 * 
 * Replace VEGA_INSTALLER_URL with your production hosted installer URL 
 * (e.g., GitHub Releases, AWS S3, or direct CDN download link).
 * 
 * When set to "REPLACE_WITH_INSTALLER_URL" or empty, it automatically resolves
 * to the bundled website download path "/downloads/VEGA-Lab-Setup.exe".
 */
export const VEGA_INSTALLER_URL = "https://drive.google.com/uc?export=download&id=1KeAqONd_CjNDdOOgNqHZEg0sZN7tYvnX";

export function getVegaInstallerUrl(): string {
  return VEGA_INSTALLER_URL;
}
