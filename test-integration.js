// Simple test script to verify API integration is working
async function testIntegration() {
  const baseUrl = 'http://localhost:3001';

  console.log('🧪 Testing Payload CMS integration...\n');

  try {
    // Test 1: Reference Data
    console.log('1. Testing reference data endpoint...');
    const refResponse = await fetch(`${baseUrl}/api/calculate/reference-data`);
    const refData = await refResponse.json();

    if (refData.success) {
      console.log('✅ Reference data loaded successfully');
      console.log(`   - Paint Types: ${refData.data.paintTypes.length}`);
      console.log(`   - Surface Types: ${refData.data.surfaceTypes.length}`);
      console.log(`   - Paint Qualities: ${refData.data.paintQualities.length}`);
      console.log(`   - Surface Conditions: ${refData.data.surfaceConditions.length}`);
      console.log(`   - Labor Rates: ${refData.data.laborRates.length}`);
    } else {
      console.log('❌ Reference data failed');
      return;
    }

    // Test 2: Surface Cost Calculation
    console.log('\n2. Testing surface cost calculation...');
    const surfaceCostResponse = await fetch(`${baseUrl}/api/calculate/surface-cost`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        area: 10.8, // 10.8 m²
        coats: 2,
        paintTypeId: 1,
        surfaceTypeId: 1,
        paintQualityId: 2,
        surfaceConditionId: 1,
        surfaceCategory: 'wall',
        region: 'Sydney'
      })
    });

    const surfaceCostData = await surfaceCostResponse.json();

    if (surfaceCostData.success) {
      console.log('✅ Surface cost calculation successful');
      console.log(`   - Material Cost: $${surfaceCostData.costBreakdown.materialCost.toFixed(2)}`);
      console.log(`   - Labor Cost: $${surfaceCostData.costBreakdown.laborCost.toFixed(2)}`);
      console.log(`   - Total Cost: $${surfaceCostData.costBreakdown.totalCost.toFixed(2)}`);
    } else {
      console.log('❌ Surface cost calculation failed');
      console.log(surfaceCostData);
      return;
    }

    // Test 3: Area Calculation
    console.log('\n3. Testing area calculation...');
    const areaResponse = await fetch(`${baseUrl}/api/calculate/area`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        surfaceType: 'wall',
        dimensions: {
          height: 2.7,
          length: 4.0,
          doorCount: 1,
          windowCount: 2
        }
      })
    });

    const areaData = await areaResponse.json();

    if (areaData.success) {
      console.log('✅ Area calculation successful');
      console.log(`   - Gross Area: ${areaData.area.grossArea.toFixed(2)} m²`);
      console.log(`   - Net Area: ${areaData.area.netArea.toFixed(2)} m²`);
      console.log(`   - Deductions: ${areaData.area.deductions.toFixed(2)} m²`);
    } else {
      console.log('❌ Area calculation failed');
      console.log(areaData);
      return;
    }

    console.log('\n🎉 All integration tests passed! The database backend is working correctly.');
    console.log('\n📋 Next steps:');
    console.log('   • Visit http://localhost:3001/calculator to test the integrated UI');
    console.log('   • Visit http://localhost:3001/admin to manage data');
    console.log('   • Visit http://localhost:3001/demo for the original static demo');

  } catch (error) {
    console.error('❌ Integration test failed:', error.message);
  }
}

// Run the test
testIntegration();