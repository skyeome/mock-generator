import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ExportFormat, ExportOptions } from '@/lib/types';

interface ExportState {
  // Format
  format: ExportFormat;
  setFormat: (format: ExportFormat) => void;

  // Common options
  filename: string;
  setFilename: (filename: string) => void;

  // CSV options
  delimiter: ',' | ';' | '\t';
  setDelimiter: (delimiter: ',' | ';' | '\t') => void;

  includeHeader: boolean;
  setIncludeHeader: (includeHeader: boolean) => void;

  // SQL options
  tableName: string;
  setTableName: (tableName: string) => void;

  dialect: 'mysql' | 'postgresql' | 'sqlite';
  setDialect: (dialect: 'mysql' | 'postgresql' | 'sqlite') => void;

  // TypeScript options
  interfaceName: string;
  setInterfaceName: (interfaceName: string) => void;

  // Actions
  getOptions: () => ExportOptions;
  reset: () => void;
}

const DEFAULT_FORMAT: ExportFormat = 'json';
const DEFAULT_FILENAME = 'mock-data';
const DEFAULT_DELIMITER: ',' | ';' | '\t' = ',';
const DEFAULT_INCLUDE_HEADER = true;
const DEFAULT_TABLE_NAME = 'data';
const DEFAULT_DIALECT: 'mysql' | 'postgresql' | 'sqlite' = 'postgresql';
const DEFAULT_INTERFACE_NAME = 'MockData';

export const useExportStore = create<ExportState>()(
  persist(
    (set, get) => ({
      format: DEFAULT_FORMAT,
      setFormat: (format) => set({ format }),

      filename: DEFAULT_FILENAME,
      setFilename: (filename) => set({ filename }),

      delimiter: DEFAULT_DELIMITER,
      setDelimiter: (delimiter) => set({ delimiter }),

      includeHeader: DEFAULT_INCLUDE_HEADER,
      setIncludeHeader: (includeHeader) => set({ includeHeader }),

      tableName: DEFAULT_TABLE_NAME,
      setTableName: (tableName) => set({ tableName }),

      dialect: DEFAULT_DIALECT,
      setDialect: (dialect) => set({ dialect }),

      interfaceName: DEFAULT_INTERFACE_NAME,
      setInterfaceName: (interfaceName) => set({ interfaceName }),

      getOptions: () => {
        const state = get();
        return {
          format: state.format,
          filename: state.filename,
          delimiter: state.delimiter,
          includeHeader: state.includeHeader,
          tableName: state.tableName,
          dialect: state.dialect,
          interfaceName: state.interfaceName,
        };
      },

      reset: () => set({
        format: DEFAULT_FORMAT,
        filename: DEFAULT_FILENAME,
        delimiter: DEFAULT_DELIMITER,
        includeHeader: DEFAULT_INCLUDE_HEADER,
        tableName: DEFAULT_TABLE_NAME,
        dialect: DEFAULT_DIALECT,
        interfaceName: DEFAULT_INTERFACE_NAME,
      }),
    }),
    {
      name: 'mock-generator-export',
      partialize: (state) => ({
        format: state.format,
        delimiter: state.delimiter,
        includeHeader: state.includeHeader,
        tableName: state.tableName,
        dialect: state.dialect,
        interfaceName: state.interfaceName,
      }),
    }
  )
);
