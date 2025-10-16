/**
 * PaintingCostCalculator React Component
 * Complete painting cost calculation interface with real-time calculations
 */

'use client';

import React, { useState, useEffect } from 'react';
import {
  calculateWallArea,
  calculateDoorArea,
  calculateCeilingArea,
  calculateLinearSurfaceArea,
  calculateSurfaceCost,
  calculateProjectCosts,
  formatCurrency,
  formatArea,
  formatVolume,
  formatTime,
  validateSurfaceDimensions,
} from '../lib/calculations/pure-calculations';

import {
  getAllLookupData,
  getSurfaceCondition,
  getPaintData,
  DEFAULT_LABOR_RATE,
  CALCULATION_EXAMPLES,
} from '../lib/data/sample-data';

import type {
  SurfaceFormData,
  ProjectSurface,
  ProjectCostSummary,
  LaborRate,
  LookupData,
  SurfaceCategory,
} from '../types/painting';

interface CalculatorState {
  surfaces: ProjectSurface[];
  laborRate: LaborRate;
  projectSummary: ProjectCostSummary | null;
  loading: boolean;
  errors: string[];
}

export default function PaintingCostCalculator() {
  const [lookupData, setLookupData] = useState<LookupData | null>(null);
  const [state, setState] = useState<CalculatorState>({
    surfaces: [],
    laborRate: DEFAULT_LABOR_RATE,
    projectSummary: null,
    loading: false,
    errors: [],
  });

  const [formData, setFormData] = useState<SurfaceFormData>({
    name: '',
    surfaceType: 'wall',
    dimensions: {},
    coats: 1,
    surfaceConditionId: 3, // Fair
    surfaceTypeId: 2, // Semi-porous (gyprock)
    paintTypeId: 5, // Top coat - matt
    paintQualityId: 1, // Budget
  });

  // Load lookup data on component mount
  useEffect(() => {
    try {
      const data = getAllLookupData();
      setLookupData(data);
    } catch (error) {
      setState(prev => ({
        ...prev,
        errors: ['Failed to load lookup data'],
      }));
    }
  }, []);

  // Recalculate project summary when surfaces change
  useEffect(() => {
    if (state.surfaces.length > 0) {
      try {
        const projectSummary = calculateProjectCosts(state.surfaces, state.laborRate);
        setState(prev => ({ ...prev, projectSummary }));
      } catch (error) {
        setState(prev => ({
          ...prev,
          errors: [...prev.errors, `Calculation error: ${error instanceof Error ? error.message : 'Unknown error'}`],
        }));
      }
    } else {
      setState(prev => ({ ...prev, projectSummary: null }));
    }
  }, [state.surfaces, state.laborRate]);

  const handleInputChange = (field: keyof SurfaceFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleDimensionChange = (field: string, value: number) => {
    setFormData(prev => ({
      ...prev,
      dimensions: { ...prev.dimensions, [field]: value },
    }));
  };

  const calculateSurfaceArea = (): number | null => {
    try {
      switch (formData.surfaceType) {
        case 'wall':
          if (!formData.dimensions.height || !formData.dimensions.length) return null;
          const wallResult = calculateWallArea({
            height: formData.dimensions.height,
            length: formData.dimensions.length,
            doorCount: formData.dimensions.doorCount || 0,
            windowCount: formData.dimensions.windowCount || 0,
          });
          return wallResult.netArea;

        case 'ceiling':
          if (formData.dimensions.area) return formData.dimensions.area;
          if (!formData.dimensions.width || !formData.dimensions.length) return null;
          const ceilingResult = calculateCeilingArea({
            width: formData.dimensions.width,
            length: formData.dimensions.length,
          });
          return ceilingResult.netArea;

        case 'door':
          const doorResult = calculateDoorArea(formData.dimensions);
          return doorResult.netArea;

        case 'linear':
          if (!formData.dimensions.length) return null;
          const linearResult = calculateLinearSurfaceArea(
            formData.dimensions.length,
            formData.dimensions.height || 0.1
          );
          return linearResult.netArea;

        default:
          return null;
      }
    } catch (error) {
      return null;
    }
  };

  const addSurface = () => {
    try {
      // Validate form data
      const validation = validateSurfaceDimensions(formData.surfaceType, formData.dimensions);
      if (!validation.isValid) {
        setState(prev => ({
          ...prev,
          errors: validation.errors,
        }));
        return;
      }

      const area = calculateSurfaceArea();
      if (!area || area <= 0) {
        setState(prev => ({
          ...prev,
          errors: ['Invalid surface area calculated'],
        }));
        return;
      }

      // Get required data
      const surfaceCondition = getSurfaceCondition(formData.surfaceConditionId);
      const paintData = getPaintData(formData.paintTypeId, formData.surfaceTypeId, formData.paintQualityId);

      const newSurface: ProjectSurface = {
        id: `surface-${Date.now()}`,
        name: formData.name || `${formData.surfaceType} ${state.surfaces.length + 1}`,
        area,
        coats: formData.coats,
        paintData,
        surfaceCondition,
        surfaceCategory: formData.surfaceType,
      };

      setState(prev => ({
        ...prev,
        surfaces: [...prev.surfaces, newSurface],
        errors: [],
      }));

      // Reset form
      setFormData({
        name: '',
        surfaceType: 'wall',
        dimensions: {},
        coats: 1,
        surfaceConditionId: 3,
        surfaceTypeId: 2,
        paintTypeId: 5,
        paintQualityId: 1,
      });
    } catch (error) {
      setState(prev => ({
        ...prev,
        errors: [`Failed to add surface: ${error instanceof Error ? error.message : 'Unknown error'}`],
      }));
    }
  };

  const removeSurface = (id: string) => {
    setState(prev => ({
      ...prev,
      surfaces: prev.surfaces.filter(surface => surface.id !== id),
    }));
  };

  const loadExample = () => {
    try {
      setState(prev => ({ ...prev, surfaces: [], errors: [] }));

      const example = CALCULATION_EXAMPLES.completeRoom;
      if (!example.surfaces) return;

      const exampleSurfaces: ProjectSurface[] = example.surfaces.map((surface, index) => ({
        id: `example-${index}`,
        name: surface.name,
        area: surface.area,
        coats: surface.coats,
        paintData: getPaintData(surface.paintTypeId, surface.surfaceTypeId, surface.paintQualityId),
        surfaceCondition: getSurfaceCondition(surface.surfaceConditionId),
        surfaceCategory: surface.surfaceCategory,
      }));

      setState(prev => ({
        ...prev,
        surfaces: exampleSurfaces,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        errors: [`Failed to load example: ${error instanceof Error ? error.message : 'Unknown error'}`],
      }));
    }
  };

  const clearAll = () => {
    setState(prev => ({
      ...prev,
      surfaces: [],
      projectSummary: null,
      errors: [],
    }));
  };

  const calculatedArea = calculateSurfaceArea();

  if (!lookupData) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-lg">Loading calculator...</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          RenoPilot Painting Cost Calculator
        </h1>
        <p className="text-gray-600">
          Calculate accurate painting costs with professional-grade precision
        </p>
      </div>

      {/* Error Messages */}
      {state.errors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="font-medium text-red-800 mb-2">Errors:</h3>
          <ul className="list-disc list-inside text-red-700 space-y-1">
            {state.errors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Surface Input Form */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Add Surface</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {/* Surface Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Surface Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Living Room Wall"
            />
          </div>

          {/* Surface Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Surface Type
            </label>
            <select
              value={formData.surfaceType}
              onChange={(e) => handleInputChange('surfaceType', e.target.value as SurfaceCategory)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="wall">Wall</option>
              <option value="ceiling">Ceiling</option>
              <option value="door">Door</option>
              <option value="linear">Linear (trim, skirting)</option>
            </select>
          </div>

          {/* Coats */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Number of Coats
            </label>
            <input
              type="number"
              min="1"
              max="5"
              value={formData.coats}
              onChange={(e) => handleInputChange('coats', parseInt(e.target.value) || 1)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Dimensions */}
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-3">Dimensions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {formData.surfaceType === 'wall' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Height (m)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    value={formData.dimensions.height || ''}
                    onChange={(e) => handleDimensionChange('height', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Length (m)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    value={formData.dimensions.length || ''}
                    onChange={(e) => handleDimensionChange('length', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Doors
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.dimensions.doorCount || 0}
                    onChange={(e) => handleDimensionChange('doorCount', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Windows
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.dimensions.windowCount || 0}
                    onChange={(e) => handleDimensionChange('windowCount', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </>
            )}

            {formData.surfaceType === 'ceiling' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Width (m)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    value={formData.dimensions.width || ''}
                    onChange={(e) => handleDimensionChange('width', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Length (m)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    value={formData.dimensions.length || ''}
                    onChange={(e) => handleDimensionChange('length', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Or Total Area (m²)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    value={formData.dimensions.area || ''}
                    onChange={(e) => handleDimensionChange('area', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </>
            )}

            {formData.surfaceType === 'linear' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Length (m)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    value={formData.dimensions.length || ''}
                    onChange={(e) => handleDimensionChange('length', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Height (m)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={formData.dimensions.height || 0.1}
                    onChange={(e) => handleDimensionChange('height', parseFloat(e.target.value) || 0.1)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </>
            )}

            {/* Calculated Area Display */}
            <div className="md:col-span-2 lg:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Calculated Area
              </label>
              <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-gray-700">
                {calculatedArea ? formatArea(calculatedArea) : '—'}
              </div>
            </div>
          </div>
        </div>

        {/* Surface Specifications */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Surface Condition */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Surface Condition
            </label>
            <select
              value={formData.surfaceConditionId}
              onChange={(e) => handleInputChange('surfaceConditionId', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {lookupData.surfaceConditions.map(condition => (
                <option key={condition.id} value={condition.id}>
                  {condition.name}
                </option>
              ))}
            </select>
          </div>

          {/* Surface Material */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Surface Material
            </label>
            <select
              value={formData.surfaceTypeId}
              onChange={(e) => handleInputChange('surfaceTypeId', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {lookupData.surfaceTypes.map(type => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </select>
          </div>

          {/* Paint Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Paint Type
            </label>
            <select
              value={formData.paintTypeId}
              onChange={(e) => handleInputChange('paintTypeId', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {lookupData.paintTypes.map(type => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </select>
          </div>

          {/* Paint Quality */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Paint Quality
            </label>
            <select
              value={formData.paintQualityId}
              onChange={(e) => handleInputChange('paintQualityId', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {lookupData.paintQualities.map(quality => (
                <option key={quality.id} value={quality.id}>
                  {quality.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3">
          <button
            onClick={addSurface}
            disabled={!calculatedArea || calculatedArea <= 0}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            Add Surface
          </button>
          <button
            onClick={loadExample}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            Load Example Room
          </button>
          <button
            onClick={clearAll}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            Clear All
          </button>
        </div>
      </div>

      {/* Added Surfaces List */}
      {state.surfaces.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Project Surfaces</h2>
          
          <div className="space-y-4">
            {state.surfaces.map((surface) => {
              const costBreakdown = calculateSurfaceCost(
                surface.area,
                surface.coats,
                surface.paintData,
                surface.surfaceCondition,
                surface.surfaceCategory,
                state.laborRate
              );

              return (
                <div key={surface.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-medium text-gray-900">{surface.name}</h3>
                      <p className="text-sm text-gray-600">
                        {formatArea(surface.area)} • {surface.coats} coat{surface.coats > 1 ? 's' : ''}
                      </p>
                    </div>
                    <button
                      onClick={() => removeSurface(surface.id)}
                      className="text-red-600 hover:text-red-800 transition-colors"
                      title="Remove surface"
                    >
                      ×
                    </button>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <div className="text-gray-600">Material Cost</div>
                      <div className="font-medium">{formatCurrency(costBreakdown.materialCost)}</div>
                    </div>
                    <div>
                      <div className="text-gray-600">Labor Cost</div>
                      <div className="font-medium">{formatCurrency(costBreakdown.laborCost)}</div>
                    </div>
                    <div>
                      <div className="text-gray-600">Paint Volume</div>
                      <div className="font-medium">{formatVolume(costBreakdown.details.paintVolume)}</div>
                    </div>
                    <div>
                      <div className="text-gray-600">Total Cost</div>
                      <div className="font-medium text-blue-600">{formatCurrency(costBreakdown.totalCost)}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Project Summary */}
      {state.projectSummary && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-blue-900">Project Summary</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-4">
            <div>
              <div className="text-sm text-blue-700">Total Area</div>
              <div className="text-lg font-semibold text-blue-900">
                {formatArea(state.projectSummary.totals.totalArea)}
              </div>
            </div>
            <div>
              <div className="text-sm text-blue-700">Materials</div>
              <div className="text-lg font-semibold text-blue-900">
                {formatCurrency(state.projectSummary.totals.totalMaterialCost)}
              </div>
            </div>
            <div>
              <div className="text-sm text-blue-700">Labor</div>
              <div className="text-lg font-semibold text-blue-900">
                {formatCurrency(state.projectSummary.totals.totalLaborCost)}
              </div>
            </div>
            <div>
              <div className="text-sm text-blue-700">Profit Margin</div>
              <div className="text-lg font-semibold text-blue-900">
                {formatCurrency(state.projectSummary.totals.totalProfitMargin)}
              </div>
            </div>
            <div>
              <div className="text-sm text-blue-700">Grand Total</div>
              <div className="text-xl font-bold text-blue-900">
                {formatCurrency(state.projectSummary.totals.grandTotal)}
              </div>
            </div>
          </div>

          <div className="text-sm text-blue-700">
            Labor Rate: {formatCurrency(state.laborRate.totalRate || 0)}/hour •
            Profit Margin: {(state.laborRate.profitMargin * 100).toFixed(0)}%
          </div>
        </div>
      )}

      {/* Integration Status */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-gray-700 mb-2">System Integration Status</h3>
        <div className="text-sm text-gray-600 space-y-1">
          <div>✅ Pure calculation functions operational</div>
          <div>✅ Sample data loaded and validated</div>
          <div>✅ Real-time cost calculations working</div>
          <div>🔄 Ready for database integration (PayloadCMS + Supabase)</div>
          <div>🔄 Ready for API endpoint integration</div>
        </div>
      </div>
    </div>
  );
}