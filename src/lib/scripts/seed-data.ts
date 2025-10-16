import payload from 'payload'
import { getPayload } from 'payload'
import config from '../../payload.config.js'
import 'dotenv/config'

async function seedPaintingData() {
  try {
    console.log('🌱 Starting to seed painting data...')

    // Initialize Payload with config
    const payloadInstance = await getPayload({ config })

    // 1. Seed Paint Types
    console.log('📝 Seeding paint types...')
    const paintTypes = await Promise.all([
      payloadInstance.create({
        collection: 'paint-types',
        data: {
          name: 'Interior Latex',
          description: 'Standard interior latex paint for walls and ceilings',
          isActive: true,
        },
      }),
      payloadInstance.create({
        collection: 'paint-types',
        data: {
          name: 'Exterior Acrylic',
          description: 'Weather-resistant acrylic paint for exterior surfaces',
          isActive: true,
        },
      }),
      payloadInstance.create({
        collection: 'paint-types',
        data: {
          name: 'Enamel',
          description: 'Durable enamel paint for trim, doors, and high-traffic areas',
          isActive: true,
        },
      }),
    ])

    // 2. Seed Surface Types
    console.log('🏠 Seeding surface types...')
    const surfaceTypes = await Promise.all([
      payloadInstance.create({
        collection: 'surface-types',
        data: {
          name: 'Drywall',
          category: 'wall',
          description: 'Standard interior drywall surfaces',
          isActive: true,
        },
      }),
      payloadInstance.create({
        collection: 'surface-types',
        data: {
          name: 'Plaster Ceiling',
          category: 'ceiling',
          description: 'Traditional plaster ceiling surfaces',
          isActive: true,
        },
      }),
      payloadInstance.create({
        collection: 'surface-types',
        data: {
          name: 'Wood Door',
          category: 'door',
          description: 'Wooden door surfaces',
          isActive: true,
        },
      }),
      payloadInstance.create({
        collection: 'surface-types',
        data: {
          name: 'Timber Skirting',
          category: 'linear',
          description: 'Timber skirting boards and trim',
          isActive: true,
        },
      }),
    ])

    // 3. Seed Paint Qualities
    console.log('⭐ Seeding paint qualities...')
    const paintQualities = await Promise.all([
      payloadInstance.create({
        collection: 'paint-qualities',
        data: {
          name: 'Budget Paint',
          level: 'basic',
          description: 'Basic quality paint for budget projects',
          isActive: true,
        },
      }),
      payloadInstance.create({
        collection: 'paint-qualities',
        data: {
          name: 'Standard Paint',
          level: 'standard',
          description: 'Good quality paint for most residential projects',
          isActive: true,
        },
      }),
      payloadInstance.create({
        collection: 'paint-qualities',
        data: {
          name: 'Premium Paint',
          level: 'premium',
          description: 'High-quality paint with excellent coverage and durability',
          isActive: true,
        },
      }),
    ])

    // 4. Seed Surface Conditions
    console.log('🔨 Seeding surface conditions...')
    const surfaceConditions = await Promise.all([
      payloadInstance.create({
        collection: 'surface-conditions',
        data: {
          name: 'Excellent',
          description: 'Perfect condition, minimal prep required',
          prepTimeWall: 2.0,
          prepTimeCeiling: 2.5,
          prepTimeDoor: 5.0,
          prepTimeLinear: 3.0,
          isActive: true,
        },
      }),
      payloadInstance.create({
        collection: 'surface-conditions',
        data: {
          name: 'Good',
          description: 'Minor imperfections, light sanding and filling',
          prepTimeWall: 4.0,
          prepTimeCeiling: 5.0,
          prepTimeDoor: 8.0,
          prepTimeLinear: 6.0,
          isActive: true,
        },
      }),
    ])

    // 5. Seed Labor Rates
    console.log('💰 Seeding labor rates...')
    const laborRates = await Promise.all([
      payloadInstance.create({
        collection: 'labor-rates',
        data: {
          name: 'Sydney Standard Rate',
          region: 'Sydney',
          hourlyRate: 65.0,
          overheadRate: 15.0,
          profitMargin: 0.25,
          totalRate: 80.0,
          effectiveDate: new Date().toISOString(),
          isActive: true,
        },
      }),
      payloadInstance.create({
        collection: 'labor-rates',
        data: {
          name: 'Melbourne Standard Rate',
          region: 'Melbourne',
          hourlyRate: 60.0,
          overheadRate: 12.0,
          profitMargin: 0.22,
          totalRate: 72.0,
          effectiveDate: new Date().toISOString(),
          isActive: true,
        },
      }),
    ])

    // 6. Seed Paint Data (combinations)
    console.log('🎨 Seeding paint data combinations...')
    const paintDataEntries = []

    for (const paintType of paintTypes) {
      for (const surfaceType of surfaceTypes) {
        for (const quality of paintQualities) {
          // Calculate cost per m² based on quality and surface type
          let baseCost = 0.15 // Base cost per m²

          // Quality multipliers
          switch (quality.level) {
            case 'basic': baseCost *= 0.7; break
            case 'standard': baseCost *= 1.0; break
            case 'premium': baseCost *= 1.4; break
          }

          // Surface type adjustments
          if (surfaceType.category === 'ceiling') baseCost *= 1.2
          if (surfaceType.category === 'door') baseCost *= 1.5
          if (surfaceType.category === 'linear') baseCost *= 1.8

          // Paint type adjustments
          if (paintType.name.includes('Exterior')) baseCost *= 1.3
          if (paintType.name.includes('Enamel')) baseCost *= 1.6

          // Coverage (m² per litre)
          let coverage = 12 // Base coverage
          if (quality.level === 'premium') coverage = 14

          const paintDataEntry = await payloadInstance.create({
            collection: 'paint-data',
            data: {
              paintType: paintType.id,
              surfaceType: surfaceType.id,
              paintQuality: quality.id,
              costPerM2: Math.round(baseCost * 1000) / 1000, // Round to 3 decimal places
              coverage: coverage,
              notes: `${quality.name} ${paintType.name} for ${surfaceType.name}`,
              isActive: true,
            },
          })

          paintDataEntries.push(paintDataEntry)
        }
      }
    }

    console.log('✅ Seed data creation completed successfully!')
    console.log(`Created:`)
    console.log(`  📝 ${paintTypes.length} paint types`)
    console.log(`  🏠 ${surfaceTypes.length} surface types`)
    console.log(`  ⭐ ${paintQualities.length} paint qualities`)
    console.log(`  🔨 ${surfaceConditions.length} surface conditions`)
    console.log(`  💰 ${laborRates.length} labor rates`)
    console.log(`  🎨 ${paintDataEntries.length} paint data combinations`)

    console.log('\\n🎉 Database seeding completed! You can now:')
    console.log('  • Access the admin panel to manage data')
    console.log('  • Use the API endpoints for calculations')
    console.log('  • Run the example scripts to test functionality')

    process.exit(0)
  } catch (error) {
    console.error('❌ Error seeding painting data:', error)
    process.exit(1)
  }
}

// Run the seed function
seedPaintingData()