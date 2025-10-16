import type { CollectionConfig } from 'payload'

export const SurfaceConditions: CollectionConfig = {
  slug: 'surface-conditions',
  labels: {
    singular: 'Surface Condition',
    plural: 'Surface Conditions',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      label: 'Condition Name',
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Description',
    },
    {
      name: 'prepTimeWall',
      type: 'number',
      required: true,
      label: 'Prep Time Wall (minutes per m²)',
      admin: {
        step: 0.1,
      },
    },
    {
      name: 'prepTimeCeiling',
      type: 'number',
      required: true,
      label: 'Prep Time Ceiling (minutes per m²)',
      admin: {
        step: 0.1,
      },
    },
    {
      name: 'prepTimeDoor',
      type: 'number',
      required: true,
      label: 'Prep Time Door (minutes per m²)',
      admin: {
        step: 0.1,
      },
    },
    {
      name: 'prepTimeLinear',
      type: 'number',
      required: true,
      label: 'Prep Time Linear (minutes per m²)',
      admin: {
        step: 0.1,
      },
    },
    {
      name: 'isActive',
      type: 'checkbox',
      defaultValue: true,
      label: 'Active',
    },
  ],
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'prepTimeWall', 'prepTimeCeiling', 'isActive'],
  },
}