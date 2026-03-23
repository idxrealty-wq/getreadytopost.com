import { initializeVendorPhase1Data } from '@/lib/vendor-service';

export async function seedVendorData(): Promise<void> {
  try {
    await initializeVendorPhase1Data();
    console.log('✓ Vendor data initialized successfully');
  } catch (error) {
    console.error('✗ Failed to initialize vendor data:', error);
    throw error;
  }
}
