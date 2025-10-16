import type { CollectionConfig } from 'payload'

export const PaintQualities: CollectionConfig = {
  slug: 'paint-qualities',
  labels: {
    singular: 'Paint Quality',
    plural: 'Paint Qualities',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      label: 'Quality Name',
    },
    {
      name: 'level',
      type: 'select',
      required: true,
      options: [
        { label: 'Basic', value: 'basic' },
        { label: 'Standard', value: 'standard' },
        { label: 'Premium', value: 'premium' },
        { label: 'Luxury', value: 'luxury' },
      ],
      label: 'Quality Level',
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Description',
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
    defaultColumns: ['name', 'level', 'isActive'],
  },
}