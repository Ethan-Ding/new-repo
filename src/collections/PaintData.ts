import type { CollectionConfig } from 'payload'

export const PaintData: CollectionConfig = {
  slug: 'paint-data',
  labels: {
    singular: 'Paint Data',
    plural: 'Paint Data',
  },
  fields: [
    {
      name: 'paintType',
      type: 'relationship',
      relationTo: 'paint-types',
      required: true,
      label: 'Paint Type',
    },
    {
      name: 'surfaceType',
      type: 'relationship',
      relationTo: 'surface-types',
      required: true,
      label: 'Surface Type',
    },
    {
      name: 'paintQuality',
      type: 'relationship',
      relationTo: 'paint-qualities',
      required: true,
      label: 'Paint Quality',
    },
    {
      name: 'costPerM2',
      type: 'number',
      required: true,
      label: 'Cost per m² (AUD)',
      admin: {
        step: 0.001,
      },
    },
    {
      name: 'coverage',
      type: 'number',
      required: true,
      label: 'Coverage (m² per litre)',
      admin: {
        step: 0.1,
      },
    },
    {
      name: 'notes',
      type: 'textarea',
      label: 'Notes',
    },
    {
      name: 'isActive',
      type: 'checkbox',
      defaultValue: true,
      label: 'Active',
    },
  ],
  admin: {
    defaultColumns: ['paintType', 'surfaceType', 'paintQuality', 'costPerM2', 'coverage', 'isActive'],
  },
  indexes: [
    {
      fields: ['paintType', 'surfaceType', 'paintQuality'],
      unique: true,
    },
  ],
}