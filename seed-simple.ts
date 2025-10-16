import { PayloadPaintingService } from './src/lib/services/payload-service'

// This is a simple test to verify the integration is working
export async function testIntegration() {
  try {
    console.log('Testing Payload integration...')

    // This would normally require the database to be seeded first
    const paintTypes = await PayloadPaintingService.getPaintTypes()
    console.log('Paint Types:', paintTypes)

    return true
  } catch (error) {
    console.error('Integration test failed:', error instanceof Error ? error.message : String(error))
    return false
  }
}