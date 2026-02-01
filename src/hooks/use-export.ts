'use client';

import { useCallback } from 'react';
import { useGeneratorStore } from '@/store/generator-store';
import { useExportStore } from '@/store/export-store';
import {
  exportToJson,
  exportToCsv,
  exportToSql,
  exportToTypeScript
} from '@/lib/export';

export function useExport() {
  const { generatedData } = useGeneratorStore();
  const { format, getOptions } = useExportStore();

  const downloadFile = useCallback((content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, []);

  const copyToClipboard = useCallback(async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      return true;
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      return false;
    }
  }, []);

  const exportData = useCallback(() => {
    if (!generatedData || generatedData.length === 0) {
      console.warn('No data to export');
      return null;
    }

    const options = getOptions();
    let content: string;
    let extension: string;

    switch (format) {
      case 'json':
        content = exportToJson(generatedData, {
          indent: 2,
        });
        extension = 'json';
        break;

      case 'csv':
        content = exportToCsv(generatedData, {
          delimiter: options.delimiter,
          includeHeader: options.includeHeader,
        });
        extension = 'csv';
        break;

      case 'sql':
        content = exportToSql(generatedData, {
          tableName: options.tableName || 'data',
          dialect: options.dialect,
        });
        extension = 'sql';
        break;

      case 'typescript':
        content = exportToTypeScript(generatedData, {
          interfaceName: options.interfaceName || 'MockData',
        });
        extension = 'ts';
        break;

      default:
        console.error('Unknown export format:', format);
        return null;
    }

    return { content, extension };
  }, [generatedData, format, getOptions]);

  const download = useCallback(() => {
    const result = exportData();
    if (!result) return;

    const options = getOptions();
    const filename = `${options.filename}.${result.extension}`;
    downloadFile(result.content, filename);
  }, [exportData, getOptions, downloadFile]);

  const copy = useCallback(async () => {
    const result = exportData();
    if (!result) return false;

    return await copyToClipboard(result.content);
  }, [exportData, copyToClipboard]);

  return {
    download,
    copy,
    exportData,
  };
}
