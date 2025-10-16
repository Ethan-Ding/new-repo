import type { CollectionConfig } from 'payload'

export const PaintTypes: CollectionConfig = {
  slug: 'paint-types',
  labels: {
    singular: 'Paint Type',
    plural: 'Paint Types',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      label: 'Paint Type Name',
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
    defaultColumns: ['name', 'description', 'isActive'],
  },
}