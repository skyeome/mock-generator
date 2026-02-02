'use client';

import { useState, useCallback, useMemo } from 'react';
import { FileUploadPanel } from './file-upload-panel';
import { KeyTree } from './key-tree';
import { DiffViewer } from './diff-viewer';
import { ExportPanel } from './export-panel';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertCircle, Languages, Loader2 } from 'lucide-react';

interface DiffOperation {
  type: 'MISSING' | 'ORPHANED' | 'TYPE_MISMATCH' | 'VALUE_DIFF' | 'EQUAL';
  keyPath: string;
  sourceValue: unknown;
  targetValue: unknown;
}

export function I18nSyncPage() {
  const [sourceLocale, setSourceLocale] = useState('en');
  const [targetLocale, setTargetLocale] = useState('ko');
  const [sourceContent, setSourceContent] = useState('');
  const [targetContent, setTargetContent] = useState('');
  const [sourceFileName, setSourceFileName] = useState('');
  const [targetFileName, setTargetFileName] = useState('');
  const [sourceError, setSourceError] = useState<string | null>(null);
  const [targetError, setTargetError] = useState<string | null>(null);
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [isTranslating, setIsTranslating] = useState(false);
  const [translationProgress, setTranslationProgress] = useState(0);
  const [selectedKeyForView, setSelectedKeyForView] = useState<string | null>(null);

  // Parse JSON and compute diff operations
  const operations = useMemo<DiffOperation[]>(() => {
    if (!sourceContent || !targetContent) return [];

    try {
      const source = JSON.parse(sourceContent);
      const target = JSON.parse(targetContent);

      const ops: DiffOperation[] = [];

      const traverse = (srcObj: any, tgtObj: any, path: string[] = []) => {
        if (typeof srcObj !== 'object' || srcObj === null) {
          const keyPath = path.join('.');
          const targetVal = tgtObj;

          if (targetVal === undefined) {
            ops.push({
              type: 'MISSING',
              keyPath,
              sourceValue: srcObj,
              targetValue: undefined,
            });
          } else if (typeof srcObj !== typeof targetVal) {
            ops.push({
              type: 'TYPE_MISMATCH',
              keyPath,
              sourceValue: srcObj,
              targetValue: targetVal,
            });
          } else if (srcObj !== targetVal) {
            ops.push({
              type: 'VALUE_DIFF',
              keyPath,
              sourceValue: srcObj,
              targetValue: targetVal,
            });
          } else {
            ops.push({
              type: 'EQUAL',
              keyPath,
              sourceValue: srcObj,
              targetValue: targetVal,
            });
          }
          return;
        }

        for (const key in srcObj) {
          const newPath = [...path, key];
          const srcVal = srcObj[key];
          const tgtVal = tgtObj?.[key];

          if (typeof srcVal === 'object' && srcVal !== null && !Array.isArray(srcVal)) {
            traverse(srcVal, tgtVal || {}, newPath);
          } else {
            const keyPath = newPath.join('.');

            if (tgtVal === undefined) {
              ops.push({
                type: 'MISSING',
                keyPath,
                sourceValue: srcVal,
                targetValue: undefined,
              });
            } else if (typeof srcVal !== typeof tgtVal) {
              ops.push({
                type: 'TYPE_MISMATCH',
                keyPath,
                sourceValue: srcVal,
                targetValue: tgtVal,
              });
            } else if (JSON.stringify(srcVal) !== JSON.stringify(tgtVal)) {
              ops.push({
                type: 'VALUE_DIFF',
                keyPath,
                sourceValue: srcVal,
                targetValue: tgtVal,
              });
            } else {
              ops.push({
                type: 'EQUAL',
                keyPath,
                sourceValue: srcVal,
                targetValue: tgtVal,
              });
            }
          }
        }
      };

      // Check for orphaned keys in target
      const checkOrphaned = (srcObj: any, tgtObj: any, path: string[] = []) => {
        if (typeof tgtObj !== 'object' || tgtObj === null) return;

        for (const key in tgtObj) {
          const newPath = [...path, key];
          const tgtVal = tgtObj[key];
          const srcVal = srcObj?.[key];

          if (srcVal === undefined) {
            ops.push({
              type: 'ORPHANED',
              keyPath: newPath.join('.'),
              sourceValue: undefined,
              targetValue: tgtVal,
            });
          } else if (typeof tgtVal === 'object' && tgtVal !== null && !Array.isArray(tgtVal)) {
            checkOrphaned(srcVal, tgtVal, newPath);
          }
        }
      };

      traverse(source, target);
      checkOrphaned(source, target);

      return ops;
    } catch {
      return [];
    }
  }, [sourceContent, targetContent]);

  const stats = useMemo(() => {
    const missing = operations.filter((op) => op.type === 'MISSING').length;
    const orphaned = operations.filter((op) => op.type === 'ORPHANED').length;
    const mismatch = operations.filter((op) => op.type === 'TYPE_MISMATCH').length;
    return { missing, orphaned, mismatch };
  }, [operations]);

  const handleSourceContent = useCallback((content: string) => {
    setSourceContent(content);
    setSourceFileName('source.json');
    try {
      JSON.parse(content);
      setSourceError(null);
    } catch (e) {
      setSourceError('Invalid JSON format');
    }
  }, []);

  const handleTargetContent = useCallback((content: string) => {
    setTargetContent(content);
    setTargetFileName('target.json');
    try {
      JSON.parse(content);
      setTargetError(null);
    } catch (e) {
      setTargetError('Invalid JSON format');
    }
  }, []);

  const handleToggleKey = useCallback((key: string) => {
    setSelectedKeys((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  }, []);

  const handleSelectAllMissing = useCallback(() => {
    const missingKeys = operations
      .filter((op) => op.type === 'MISSING')
      .map((op) => op.keyPath);
    setSelectedKeys(missingKeys);
  }, [operations]);

  const handleClearSelection = useCallback(() => {
    setSelectedKeys([]);
  }, []);

  const handleSelectKey = useCallback((key: string) => {
    setSelectedKeyForView(key);
  }, []);

  const handleTargetContentChange = useCallback((content: string) => {
    setTargetContent(content);
    try {
      JSON.parse(content);
      setTargetError(null);
    } catch (e) {
      setTargetError('Invalid JSON format');
    }
  }, []);

  const handleTranslate = useCallback(async () => {
    if (selectedKeys.length === 0) return;

    setIsTranslating(true);
    setTranslationProgress(10);

    try {
      // Get source values for selected keys
      const entries = selectedKeys.map((key) => {
        const op = operations.find((o) => o.keyPath === key);
        return {
          key,
          value: String(op?.sourceValue ?? ''),
        };
      });

      setTranslationProgress(30);

      // Call the translation API
      const response = await fetch('/api/intl/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceLocale,
          targetLocale,
          entries,
        }),
      });

      setTranslationProgress(70);

      const data = await response.json() as {
        success: boolean;
        translations?: Record<string, string>;
        error?: string;
        fallback?: boolean;
      };

      if (!data.success || !data.translations) {
        throw new Error(data.error || 'Translation failed');
      }

      setTranslationProgress(90);

      // Update target content with translations
      const target = JSON.parse(targetContent);
      for (const [key, value] of Object.entries(data.translations)) {
        const keys = key.split('.');
        let current = target;
        for (let i = 0; i < keys.length - 1; i++) {
          if (!current[keys[i]]) {
            current[keys[i]] = {};
          }
          current = current[keys[i]];
        }
        current[keys[keys.length - 1]] = value;
      }

      setTargetContent(JSON.stringify(target, null, 2));
      setTranslationProgress(100);

      // Clear selection after successful translation
      setSelectedKeys([]);
    } catch (error) {
      console.error('Translation error:', error);
      alert(`Translation failed: ${(error as Error).message}`);
    } finally {
      setIsTranslating(false);
      setTranslationProgress(0);
    }
  }, [selectedKeys, operations, sourceLocale, targetLocale, targetContent]);

  const handleExport = useCallback(() => {
    if (!targetContent) return '{}';

    try {
      const target = JSON.parse(targetContent);
      return JSON.stringify(target, null, 2);
    } catch {
      return '{}';
    }
  }, [targetContent]);

  const hasFiles = sourceContent && targetContent;

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">i18n Sync Tool</h1>
          <p className="text-muted-foreground">
            AI-powered translation synchronization for i18n JSON files
          </p>
        </div>

        {/* File Upload */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FileUploadPanel
            label="Source Language"
            locale={sourceLocale}
            onLocaleChange={setSourceLocale}
            onFileContent={handleSourceContent}
            error={sourceError}
            fileName={sourceFileName}
          />
          <FileUploadPanel
            label="Target Language"
            locale={targetLocale}
            onLocaleChange={setTargetLocale}
            onFileContent={handleTargetContent}
            error={targetError}
            fileName={targetFileName}
          />
        </div>

        {/* Stats */}
        {hasFiles && (
          <div className="flex items-center gap-3 p-4 bg-card border border-border rounded-lg">
            <AlertCircle className="w-5 h-5 text-muted-foreground" />
            <div className="flex items-center gap-3 flex-wrap">
              <Badge variant={stats.missing > 0 ? 'destructive' : 'secondary'}>
                {stats.missing} Missing
              </Badge>
              <Badge variant={stats.orphaned > 0 ? 'secondary' : 'secondary'}>
                {stats.orphaned} Orphaned
              </Badge>
              <Badge variant={stats.mismatch > 0 ? 'secondary' : 'secondary'}>
                {stats.mismatch} Type Mismatch
              </Badge>
              <span className="text-sm text-muted-foreground">
                {operations.length} total keys
              </span>
            </div>
          </div>
        )}

        {/* Main Content */}
        {hasFiles && (
          <div className="flex flex-col gap-4">
            {/* Top Section: KeyTree Sidebar + Monaco DiffEditor */}
            <div className="flex gap-4 h-[600px]">
              {/* KeyTree Sidebar */}
              <div className="w-[250px] flex-shrink-0">
                <div className="h-full bg-card border border-border rounded-lg overflow-hidden flex flex-col">
                  {/* Header */}
                  <div className="px-4 py-3 border-b border-border bg-muted/50">
                    <h3 className="text-sm font-semibold text-foreground">Translation Keys</h3>
                    <div className="flex items-center gap-3 mt-2 text-xs">
                      <span className="text-muted-foreground">
                        {operations.length} keys
                      </span>
                      {stats.missing > 0 && (
                        <span className="text-destructive font-medium">
                          {stats.missing} missing
                        </span>
                      )}
                    </div>
                  </div>

                  {/* KeyTree */}
                  <KeyTree
                    operations={operations}
                    selectedKeys={selectedKeys}
                    onToggleKey={handleToggleKey}
                    onSelectKey={handleSelectKey}
                  />
                </div>
              </div>

              {/* Monaco DiffEditor */}
              <div className="flex-1">
                <DiffViewer
                  source={sourceContent}
                  target={targetContent}
                  onTargetChange={handleTargetContentChange}
                  onKeySelect={handleSelectKey}
                  height="600px"
                />
              </div>
            </div>

            {/* Bottom Section: Validation Summary + Translation Control */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Validation Summary */}
              <div className="lg:col-span-2 bg-card border border-border rounded-lg p-4">
                <h3 className="text-sm font-semibold text-foreground mb-3">Actions</h3>
                <div className="flex items-center gap-2 flex-wrap">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={handleSelectAllMissing}
                    disabled={stats.missing === 0}
                  >
                    Select All Missing ({stats.missing})
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleClearSelection}
                    disabled={selectedKeys.length === 0}
                  >
                    Clear Selection ({selectedKeys.length})
                  </Button>
                </div>
              </div>

              {/* Translation Control */}
              <div className="bg-card border border-border rounded-lg p-4">
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                    <Languages className="w-4 h-4 text-primary" />
                    <h3 className="text-sm font-semibold text-foreground">AI Translation</h3>
                  </div>

                  {isTranslating ? (
                    <>
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 text-primary animate-spin" />
                        <span className="text-sm text-muted-foreground">
                          Translating... {Math.round(translationProgress)}%
                        </span>
                      </div>
                      <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary transition-all duration-300"
                          style={{ width: `${translationProgress}%` }}
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <p className="text-sm text-muted-foreground">
                        {selectedKeys.length === 0
                          ? 'Select keys to translate'
                          : `${selectedKeys.length} ${selectedKeys.length === 1 ? 'key' : 'keys'} selected`}
                      </p>
                      <Button
                        onClick={handleTranslate}
                        disabled={!hasFiles || selectedKeys.length === 0}
                        className="w-full"
                      >
                        <Languages className="w-4 h-4 mr-2" />
                        Translate Selected
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Export Panel */}
        {hasFiles && (
          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <ExportPanel onExport={handleExport} disabled={!hasFiles} />
          </div>
        )}
      </div>
    </div>
  );
}
