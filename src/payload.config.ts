// storage-adapter-import-placeholder
import { postgresAdapter } from '@payloadcms/db-postgres'
import { payloadCloudPlugin } from '@payloadcms/payload-cloud'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Paintcolor } from './collections/Paintcolor'
import { PaintTypes } from './collections/PaintTypes'
import { SurfaceTypes } from './collections/SurfaceTypes'
import { PaintQualities } from './collections/PaintQualities'
import { SurfaceConditions } from './collections/SurfaceConditions'
import { PaintData } from './collections/PaintData'
import { LaborRates } from './collections/LaborRates'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [
    Users,
    Media,
    Paintcolor,
    PaintTypes,
    SurfaceTypes,
    PaintQualities,
    SurfaceConditions,
    PaintData,
    LaborRates,
  ],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URI || '',
    },
  }),
  sharp,
  plugins: [
    payloadCloudPlugin(),
    // storage-adapter-placeholder
  ],
})
