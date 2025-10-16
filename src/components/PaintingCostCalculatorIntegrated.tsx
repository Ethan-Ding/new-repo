/**
 * Database-Integrated Painting Cost Calculator
 * Uses Payload CMS backend for data and calculations
 */

'use client';

import React, { useState, useEffect } from 'react';
import {
  calculateWallArea,
  calculateDoorArea,
  calculateCeilingArea,
  calculateLinearSurfaceArea,
  formatCurrency,
  formatArea,
  formatVolume,
  formatTime,
  validateSurfaceDimensions,
} from '../lib/calculations/pure-calculations';

// Types for the integrated calculator
interface DatabaseLookupData {
  paintTypes: Array<{ value: number; label: string }>;
  surfaceTypes: Array<{ value: number; label: string; category: string }>;
  paintQualities: Array<{ value: number; label: string; level: string }>;
  surfaceConditions: Array<{ value: number; label: string }>;
  laborRates: Array<{ value: number; label: string; region?: string }>;
}

interface SurfaceFormData {
  name: string;
  surfaceType: 'wall' | 'ceiling' | 'door' | 'linear';
  dimensions: {
    height?: number;
    length?: number;
    width?: number;
    area?: number;
    doorCount?: number;
    windowCount?: number;
  };
  coats: number;
  paintTypeId: number;
  surfaceTypeId: number;
  paintQualityId: number;
  surfaceConditionId: number;
  laborRateId?: number;
  region?: string;
}

interface ProjectSurface {
  id: string;
  name: string;
  area: number;
  coats: number;
  paintTypeId: number;
  surfaceTypeId: number;
  paintQualityId: number;
  surfaceConditionId: number;
  surfaceCategory: string;
  costBreakdown?: any;
}

interface CalculatorState {
  surfaces: ProjectSurface[];
  projectSummary: any | null;
  loading: boolean;
  errors: string[];
}

export default function PaintingCostCalculatorIntegrated() {
  const [lookupData, setLookupData] = useState<DatabaseLookupData | null>(null);
  const [state, setState] = useState<CalculatorState>({
    surfaces: [],
    projectSummary: null,
    loading: false,
    errors: [],
  });

  const [formData, setFormData] = useState<SurfaceFormData>({
    name: '',
    surfaceType: 'wall',
    dimensions: {},
    coats: 2,
    surfaceConditionId: 1,
    surfaceTypeId: 1,
    paintTypeId: 1,
    paintQualityId: 2, // Standard
    region: 'Sydney',
  });

  // Load lookup data from database on component mount
  useEffect(() => {
    const loadReferenceData = async () => {
      try {
        setState(prev => ({ ...prev, loading: true, errors: [] }));

        const response = await fetch('/api/calculate/reference-data');
        if (!response.ok) {
          throw new Error(`Failed to load reference data: ${response.statusText}`);
        }

        const result = await response.json();
        if (!result.success) {
          throw new Error('Reference data request failed');
        }

        // Transform API data to component format
        const transformedData: DatabaseLookupData = {
          paintTypes: result.data.paintTypes.map((item: any) => ({
            value: item.id,
            label: item.name,
          })),
          surfaceTypes: result.data.surfaceTypes.map((item: any) => ({
            value: item.id,
            label: item.name,
            category: item.category,
          })),
          paintQualities: result.data.paintQualities.map((item: any) => ({
            value: item.id,
            label: item.name,
            level: item.level,
          })),
          surfaceConditions: result.data.surfaceConditions.map((item: any) => ({
            value: item.id,
            label: item.name,
          })),
          laborRates: result.data.laborRates.map((item: any) => ({
            value: item.id,
            label: `${item.name} (${item.region})`,
            region: item.region,
          })),
        };

        setLookupData(transformedData);

        // Set default form values from transformed data
        if (transformedData.paintTypes.length > 0) {
          setFormData(prev => ({ ...prev, paintTypeId: transformedData.paintTypes[0].value }));
        }
        if (transformedData.surfaceTypes.length > 0) {
          setFormData(prev => ({ ...prev, surfaceTypeId: transformedData.surfaceTypes[0].value }));
        }
        if (transformedData.paintQualities.length > 0) {
          const standardQuality = transformedData.paintQualities.find(q => q.level === 'standard');
          if (standardQuality) {
            setFormData(prev => ({ ...prev, paintQualityId: standardQuality.value }));
          }
        }
        if (transformedData.surfaceConditions.length > 0) {
          const goodCondition = transformedData.surfaceConditions.find(c => c.label.toLowerCase().includes('good'));
          if (goodCondition) {
            setFormData(prev => ({ ...prev, surfaceConditionId: goodCondition.value }));
          }
        }

      } catch (error) {
        setState(prev => ({
          ...prev,
          errors: [`Failed to load reference data: ${error instanceof Error ? error.message : 'Unknown error'}`],
        }));
      } finally {
        setState(prev => ({ ...prev, loading: false }));
      }
    };

    loadReferenceData();
  }, []);

  // Recalculate project summary when surfaces change
  useEffect(() => {
    if (state.surfaces.length > 0) {
      calculateProjectSummary();
    } else {
      setState(prev => ({ ...prev, projectSummary: null }));
    }
  }, [state.surfaces]);

  const calculateProjectSummary = async () => {
    try {
      setState(prev => ({ ...prev, loading: true }));

      const response = await fetch('/api/calculate/project-cost', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          surfaces: state.surfaces.map(surface => ({
            id: surface.id,
            name: surface.name,
            area: surface.area,
            coats: surface.coats,
            paintTypeId: surface.paintTypeId,
            surfaceTypeId: surface.surfaceTypeId,
            paintQualityId: surface.paintQualityId,
            surfaceConditionId: surface.surfaceConditionId,
            surfaceCategory: surface.surfaceCategory,
          })),
          region: formData.region,
        }),
      });

      if (!response.ok) {
        throw new Error(`Project calculation failed: ${response.statusText}`);
      }

      const result = await response.json();
      if (!result.success) {
        throw new Error('Project calculation request failed');
      }

      setState(prev => ({
        ...prev,
        projectSummary: result.projectCosts,
      }));

    } catch (error) {
      setState(prev => ({
        ...prev,
        errors: [...prev.errors, `Project calculation error: ${error instanceof Error ? error.message : 'Unknown error'}`],
      }));
    } finally {
      setState(prev => ({ ...prev, loading: false }));
    }
  };

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

  const addSurface = async () => {
    try {
      setState(prev => ({ ...prev, loading: true, errors: [] }));

      // Validate form data
      const validation = validateSurfaceDimensions(formData.surfaceType, formData.dimensions);
      if (!validation.isValid) {
        setState(prev => ({
          ...prev,
          errors: validation.errors,
          loading: false,
        }));
        return;
      }

      const area = calculateSurfaceArea();
      if (!area || area <= 0) {
        setState(prev => ({
          ...prev,
          errors: ['Invalid surface area calculated'],
          loading: false,
        }));
        return;
      }

      // Calculate surface cost using database backend
      const response = await fetch('/api/calculate/surface-cost', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          area,
          coats: formData.coats,
          paintTypeId: formData.paintTypeId,
          surfaceTypeId: formData.surfaceTypeId,
          paintQualityId: formData.paintQualityId,
          surfaceConditionId: formData.surfaceConditionId,
          surfaceCategory: formData.surfaceType,
          laborRateId: formData.laborRateId,
          region: formData.region,
        }),
      });

      if (!response.ok) {
        throw new Error(`Surface calculation failed: ${response.statusText}`);
      }

      const result = await response.json();
      if (!result.success) {
        throw new Error('Surface calculation request failed');
      }

      const newSurface: ProjectSurface = {
        id: `surface-${Date.now()}`,
        name: formData.name || `${formData.surfaceType} ${state.surfaces.length + 1}`,
        area,
        coats: formData.coats,
        paintTypeId: formData.paintTypeId,
        surfaceTypeId: formData.surfaceTypeId,
        paintQualityId: formData.paintQualityId,
        surfaceConditionId: formData.surfaceConditionId,
        surfaceCategory: formData.surfaceType,
        costBreakdown: result.costBreakdown,
      };

      setState(prev => ({
        ...prev,
        surfaces: [...prev.surfaces, newSurface],
        errors: [],
      }));

      // Reset form
      setFormData(prev => ({
        ...prev,
        name: '',
        dimensions: {},
      }));

    } catch (error) {
      setState(prev => ({
        ...prev,
        errors: [`Failed to add surface: ${error instanceof Error ? error.message : 'Unknown error'}`],
      }));
    } finally {
      setState(prev => ({ ...prev, loading: false }));
    }
  };

  const removeSurface = (id: string) => {
    setState(prev => ({
      ...prev,
      surfaces: prev.surfaces.filter(surface => surface.id !== id),
    }));
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
        <div className="text-lg">Loading calculator from database...</div>
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
          Database-integrated professional painting cost estimation
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

      {/* Loading Indicator */}
      {state.loading && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
            <span className="text-blue-800">Processing...</span>
          </div>
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
              onChange={(e) => handleInputChange('surfaceType', e.target.value)}
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

        {/* Dimensions Section */}
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

        {/* Database-driven Surface Specifications */}
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
              {lookupData.surfaceConditions.map((condition, index) => (
                <option key={`condition-${condition.value}-${index}`} value={condition.value}>
                  {condition.label}
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
              {lookupData.surfaceTypes.map((type, index) => (
                <option key={`surface-type-${type.value}-${index}`} value={type.value}>
                  {type.label}
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
              {lookupData.paintTypes.map((type, index) => (
                <option key={`paint-type-${type.value}-${index}`} value={type.value}>
                  {type.label}
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
              {lookupData.paintQualities.map((quality, index) => (
                <option key={`paint-quality-${quality.value}-${index}`} value={quality.value}>
                  {quality.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Region Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Region
            </label>
            <select
              value={formData.region}
              onChange={(e) => handleInputChange('region', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Sydney">Sydney</option>
              <option value="Melbourne">Melbourne</option>
              <option value="Brisbane">Brisbane</option>
            </select>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3">
          <button
            onClick={addSurface}
            disabled={!calculatedArea || calculatedArea <= 0 || state.loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {state.loading ? 'Calculating...' : 'Add Surface'}
          </button>
          <button
            onClick={clearAll}
            disabled={state.loading}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-300 transition-colors"
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
            {state.surfaces.map((surface) => (
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

                {surface.costBreakdown && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <div className="text-gray-600">Material Cost</div>
                      <div className="font-medium">{formatCurrency(surface.costBreakdown.materialCost)}</div>
                    </div>
                    <div>
                      <div className="text-gray-600">Labor Cost</div>
                      <div className="font-medium">{formatCurrency(surface.costBreakdown.laborCost)}</div>
                    </div>
                    <div>
                      <div className="text-gray-600">Paint Volume</div>
                      <div className="font-medium">{formatVolume(surface.costBreakdown.details.paintVolume)}</div>
                    </div>
                    <div>
                      <div className="text-gray-600">Total Cost</div>
                      <div className="font-medium text-blue-600">{formatCurrency(surface.costBreakdown.totalCost)}</div>
                    </div>
                  </div>
                )}
              </div>
            ))}
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
            Powered by Payload CMS database with real-time calculations
          </div>
        </div>
      )}

      {/* Integration Status */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-green-700 mb-2">Database Integration Status</h3>
        <div className="text-sm text-green-600 space-y-1">
          <div>✅ Connected to Payload CMS backend</div>
          <div>✅ Loading data from database collections</div>
          <div>✅ Real-time cost calculations with database pricing</div>
          <div>✅ Regional labor rates and material costs</div>
          <div>✅ Professional-grade calculation accuracy</div>
        </div>
      </div>
    </div>
  );
}