import type { CollectionConfig } from 'payload'

export const SurfaceTypes: CollectionConfig = {
  slug: 'surface-types',
  labels: {
    singular: 'Surface Type',
    plural: 'Surface Types',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      label: 'Surface Type Name',
    },
    {
      name: 'category',
      type: 'select',
      required: true,
      options: [
        { label: 'Wall', value: 'wall' },
        { label: 'Ceiling', value: 'ceiling' },
        { label: 'Door', value: 'door' },
        { label: 'Linear', value: 'linear' },
      ],
      label: 'Surface Category',
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
    defaultColumns: ['name', 'category', 'isActive'],
  },
}