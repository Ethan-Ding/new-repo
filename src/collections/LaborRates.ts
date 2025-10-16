import type { CollectionConfig } from 'payload'

export const LaborRates: CollectionConfig = {
  slug: 'labor-rates',
  labels: {
    singular: 'Labor Rate',
    plural: 'Labor Rates',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      label: 'Rate Name',
    },
    {
      name: 'region',
      type: 'text',
      label: 'Region/Location',
    },
    {
      name: 'hourlyRate',
      type: 'number',
      required: true,
      label: 'Hourly Rate (AUD)',
      admin: {
        step: 0.01,
      },
    },
    {
      name: 'overheadRate',
      type: 'number',
      required: true,
      label: 'Overhead Rate (AUD per hour)',
      admin: {
        step: 0.01,
      },
    },
    {
      name: 'profitMargin',
      type: 'number',
      required: true,
      label: 'Profit Margin (decimal, e.g., 0.20 for 20%)',
      admin: {
        step: 0.01,
      },
    },
    {
      name: 'totalRate',
      type: 'number',
      label: 'Total Rate (calculated)',
      admin: {
        readOnly: true,
        description: 'Automatically calculated from hourly + overhead rates',
      },
      hooks: {
        beforeChange: [
          ({ data }) => {
            if (data?.hourlyRate && data?.overheadRate) {
              data.totalRate = data.hourlyRate + data.overheadRate
            }
            return data?.totalRate
          },
        ],
      },
    },
    {
      name: 'effectiveDate',
      type: 'date',
      required: true,
      label: 'Effective Date',
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
    defaultColumns: ['name', 'region', 'totalRate', 'profitMargin', 'effectiveDate', 'isActive'],
  },
}