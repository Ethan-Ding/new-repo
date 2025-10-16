import * as migration_20250902_031212_init from './20250902_031212_init';
import * as migration_20250902_031404_init from './20250902_031404_init';
import * as migration_20250918_043033 from './20250918_043033';

export const migrations = [
  {
    up: migration_20250902_031212_init.up,
    down: migration_20250902_031212_init.down,
    name: '20250902_031212_init',
  },
  {
    up: migration_20250902_031404_init.up,
    down: migration_20250902_031404_init.down,
    name: '20250902_031404_init',
  },
  {
    up: migration_20250918_043033.up,
    down: migration_20250918_043033.down,
    name: '20250918_043033'
  },
];
