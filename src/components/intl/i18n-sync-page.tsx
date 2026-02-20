"use client";

import { useCallback, useEffect, useState } from "react";
import { useIntlSync } from "@/hooks/use-intl-sync";
import { FileUploadPanel } from "./file-upload-panel";
import { KeyTree } from "./key-tree";
import { DiffViewer } from "./diff-viewer";
import { ExportPanel } from "./export-panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertCircle, Languages, Loader2, ArrowLeftRight } from "lucide-react";

export function I18nSyncPage() {
  const intl = useIntlSync();
  const [sourceFileName, setSourceFileName] = useState("");
  const [targetFileName, setTargetFileName] = useState("");
  const [selectedKeyForView, setSelectedKeyForView] = useState<string | null>(null);
  const [keyFilter, setKeyFilter] = useState<'all' | 'missing' | 'selected'>('all');

  // Run diff when source or target changes
  useEffect(() => {
    intl.runDiff();
  }, [intl.sourceParsed, intl.targetParsed, intl.runDiff]);

  const operations = intl.diffResult?.operations ?? [];
  const stats = {
    missing: intl.diffResult?.stats.missing ?? 0,
    orphaned: intl.diffResult?.stats.orphaned ?? 0,
    mismatch: intl.diffResult?.stats.typeMismatch ?? 0,
  };

  const handleSourceContent = useCallback((content: string) => {
    intl.setSourceJson(content);
    setSourceFileName("source.json");
  }, [intl]);

  const handleTargetContent = useCallback((content: string) => {
    intl.setTargetJson(content);
    setTargetFileName("target.json");
  }, [intl]);

  const handleToggleKey = useCallback((key: string) => {
    intl.toggleKeySelection(key);
  }, [intl]);

  const handleSelectAllMissing = useCallback(() => {
    intl.selectAllMissing();
  }, [intl]);

  const handleClearSelection = useCallback(() => {
    intl.clearSelection();
  }, [intl]);

  const handleSwap = useCallback(() => {
    intl.setSourceLocale(intl.targetLocale);
    intl.setTargetLocale(intl.sourceLocale);
    intl.setSourceJson(intl.targetJson);
    intl.setTargetJson(intl.sourceJson);
    setSourceFileName(targetFileName);
    setTargetFileName(sourceFileName);
    intl.clearSelection();
  }, [intl, sourceFileName, targetFileName]);

  const handleSelectKey = useCallback((key: string) => {
    setSelectedKeyForView(key);
  }, []);

  const handleTargetContentChange = useCallback((content: string) => {
    intl.setTargetJson(content);
  }, [intl]);

  const handleTranslate = useCallback(async () => {
    await intl.translateSelected();
    // After translation, update target JSON with the exported result
    const exported = intl.exportResult();
    if (exported) {
      intl.setTargetJson(exported);
    }
    intl.clearSelection();
  }, [intl]);

  const handleExport = useCallback(() => {
    return intl.targetJson || "{}";
  }, [intl.targetJson]);

  const hasFiles = intl.sourceJson && intl.targetJson;

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            i18n Sync Tool
          </h1>
          <p className="text-muted-foreground">
            AI-powered translation synchronization for i18n JSON files
          </p>
        </div>

        {/* File Upload */}
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-2 items-start">
          <FileUploadPanel
            label="Source Language"
            locale={intl.sourceLocale}
            onLocaleChange={intl.setSourceLocale}
            onFileContent={handleSourceContent}
            error={intl.sourceError}
            fileName={sourceFileName}
          />
          <Button
            variant="secondary"
            size="sm"
            onClick={handleSwap}
            className="mt-10"
            title="Swap source and target"
          >
            <ArrowLeftRight className="w-4 h-4" />
          </Button>
          <FileUploadPanel
            label="Target Language"
            locale={intl.targetLocale}
            onLocaleChange={intl.setTargetLocale}
            onFileContent={handleTargetContent}
            error={intl.targetError}
            fileName={targetFileName}
          />
        </div>

        {/* Stats */}
        {hasFiles && (
          <div className="flex items-center gap-3 p-4 bg-card border border-border rounded-lg">
            <AlertCircle className="w-5 h-5 text-muted-foreground" />
            <div className="flex items-center gap-3 flex-wrap">
              <Badge variant={stats.missing > 0 ? "destructive" : "secondary"}>
                {stats.missing} Missing
              </Badge>
              <Badge variant={stats.orphaned > 0 ? "secondary" : "secondary"}>
                {stats.orphaned} Orphaned
              </Badge>
              <Badge variant={stats.mismatch > 0 ? "secondary" : "secondary"}>
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
              <div className="w-[250px] shrink-0">
                <div className="h-full bg-card border border-border rounded-lg overflow-hidden flex flex-col">
                  {/* Header */}
                  <div className="px-4 py-3 border-b border-border bg-muted/50">
                    <h3 className="text-sm font-semibold text-foreground">
                      Translation Keys
                    </h3>
                    <div className="flex items-center gap-1 mt-2">
                      <button
                        onClick={() => setKeyFilter('all')}
                        className={`px-2 py-1 text-xs rounded transition-colors ${
                          keyFilter === 'all'
                            ? 'bg-primary text-primary-foreground'
                            : 'text-muted-foreground hover:bg-muted'
                        }`}
                      >
                        All ({operations.length})
                      </button>
                      <button
                        onClick={() => setKeyFilter('missing')}
                        className={`px-2 py-1 text-xs rounded transition-colors ${
                          keyFilter === 'missing'
                            ? 'bg-destructive text-white'
                            : 'text-muted-foreground hover:bg-muted'
                        }`}
                      >
                        Missing ({stats.missing})
                      </button>
                      <button
                        onClick={() => setKeyFilter('selected')}
                        className={`px-2 py-1 text-xs rounded transition-colors ${
                          keyFilter === 'selected'
                            ? 'bg-primary text-primary-foreground'
                            : 'text-muted-foreground hover:bg-muted'
                        }`}
                      >
                        Selected ({intl.selectedKeys.length})
                      </button>
                    </div>
                  </div>

                  {/* KeyTree */}
                  <KeyTree
                    operations={operations}
                    selectedKeys={intl.selectedKeys}
                    onToggleKey={handleToggleKey}
                    onSelectKey={handleSelectKey}
                    filter={keyFilter}
                  />
                </div>
              </div>

              {/* Monaco DiffEditor */}
              <div className="flex-1">
                <DiffViewer
                  source={intl.sourceJson}
                  target={intl.targetJson}
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
                <h3 className="text-sm font-semibold text-foreground mb-3">
                  Actions
                </h3>
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
                    disabled={intl.selectedKeys.length === 0}
                  >
                    Clear Selection ({intl.selectedKeys.length})
                  </Button>
                </div>
              </div>

              {/* Translation Control */}
              <div className="bg-card border border-border rounded-lg p-4">
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                    <Languages className="w-4 h-4 text-primary" />
                    <h3 className="text-sm font-semibold text-foreground">
                      AI Translation
                    </h3>
                  </div>

                  {intl.isTranslating ? (
                    <>
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 text-primary animate-spin" />
                        <span className="text-sm text-muted-foreground">
                          Translating... {Math.round(intl.translationProgress)}%
                        </span>
                      </div>
                      <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary transition-all duration-300"
                          style={{ width: `${intl.translationProgress}%` }}
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <p className="text-sm text-muted-foreground">
                        {intl.selectedKeys.length === 0
                          ? "Select keys to translate"
                          : `${intl.selectedKeys.length} ${intl.selectedKeys.length === 1 ? "key" : "keys"} selected`}
                      </p>
                      {stats.missing > 0 && (
                        <Button
                          onClick={intl.translateAllMissing}
                          disabled={!hasFiles}
                          variant="primary"
                          className="w-full"
                        >
                          <Languages className="w-4 h-4 mr-2" />
                          Translate All Missing ({stats.missing})
                        </Button>
                      )}
                      <Button
                        onClick={handleTranslate}
                        disabled={!hasFiles || intl.selectedKeys.length === 0}
                        variant="secondary"
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
