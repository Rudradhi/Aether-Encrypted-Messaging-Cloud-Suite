/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  Upload, 
  FileText, 
  Image as ImageIcon, 
  Music, 
  ShieldCheck, 
  Download, 
  Trash2, 
  Star, 
  Search, 
  Share2, 
  Lock, 
  Eye, 
  X,
  CheckCircle,
  HardDrive
} from 'lucide-react';
import { DriveFile, Contact } from '../types';

interface CloudDriveProps {
  files: DriveFile[];
  contacts: Contact[];
  onUploadFile: (file: Partial<DriveFile>) => void;
  onDeleteFile: (id: string) => void;
  onToggleStar: (id: string) => void;
  onShareToChat: (file: DriveFile, contactId: string) => void;
}

export const CloudDrive: React.FC<CloudDriveProps> = ({
  files,
  contacts,
  onUploadFile,
  onDeleteFile,
  onToggleStar,
  onShareToChat,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [previewFile, setPreviewFile] = useState<DriveFile | null>(null);
  const [shareFileTarget, setShareFileTarget] = useState<DriveFile | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Filtered files
  const filteredFiles = useMemo(() => {
    return files.filter(f => {
      const matchCat = selectedCategory === 'all' || f.type === selectedCategory;
      const matchSearch = f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.extension.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [files, selectedCategory, searchQuery]);

  // Total storage calculated
  const totalBytes = useMemo(() => files.reduce((acc, f) => acc + f.size, 0), [files]);
  const totalGB = (totalBytes / (1024 * 1024 * 1024)).toFixed(2);
  const maxGB = 50;
  const usagePct = Math.min(100, (parseFloat(totalGB) / maxGB) * 100);

  // Upload handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    let type: DriveFile['type'] = 'document';
    if (file.type.startsWith('image/')) type = 'image';
    else if (file.type.startsWith('audio/')) type = 'audio';
    else if (file.name.endsWith('.vault') || file.name.endsWith('.enc')) type = 'vault';

    const newDriveFile: Partial<DriveFile> = {
      name: file.name,
      size: file.size,
      type,
      extension: file.name.split('.').pop()?.toUpperCase() || 'DAT',
      url: type === 'image' ? URL.createObjectURL(file) : '#',
      uploadedAt: Date.now(),
      isEncrypted: true,
      sharedInConversations: [],
    };

    onUploadFile(newDriveFile);
  };

  return (
    <div className="flex-1 h-full flex flex-col bg-neutral-50 dark:bg-neutral-950 overflow-hidden">
      {/* Top Header */}
      <header className="px-6 py-5 border-b border-neutral-200 dark:border-neutral-850 bg-white dark:bg-neutral-900 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 tracking-tight">
              Cloud Drive Storage
            </h1>
          </div>
          <p className="text-xs text-neutral-500 mt-0.5">
            Synchronized automatically across your mobile and desktop devices.
          </p>
        </div>

        {/* Upload Button */}
        <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 text-xs font-semibold hover:opacity-90 transition-opacity cursor-pointer shadow-xs shrink-0">
          <Upload className="w-4 h-4" />
          <span>Upload File</span>
          <input
            type="file"
            onChange={handleFileUpload}
            className="hidden"
          />
        </label>
      </header>

      {/* Storage HUD Usage Bar */}
      <div className="px-6 py-4 bg-white/60 dark:bg-neutral-900/40 border-b border-neutral-200 dark:border-neutral-850/80">
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="font-semibold text-neutral-800 dark:text-neutral-200">
            {totalGB} GB of {maxGB} GB Used
          </span>
          <span className="text-neutral-500 font-mono tabular-nums">
            {files.length} files
          </span>
        </div>
        <div className="w-full h-2 rounded-full bg-neutral-200 dark:bg-neutral-800 overflow-hidden flex">
          <div
            className="h-full bg-emerald-500 transition-all duration-300"
            style={{ width: `${Math.max(5, usagePct)}%` }}
          />
        </div>
      </div>

      {/* Category Tabs & Search Bar */}
      <div className="px-6 py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-neutral-200 dark:border-neutral-850">
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
          {[
            { id: 'all', label: 'All Files' },
            { id: 'document', label: 'Documents' },
            { id: 'image', label: 'Photos & Videos' },
            { id: 'audio', label: 'Voice Memos' },
            { id: 'vault', label: 'Encrypted Vault' },
          ].map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                selectedCategory === cat.id
                  ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900'
                  : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-150 dark:hover:bg-neutral-850'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-64">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search drive files..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-white dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-400"
          />
        </div>
      </div>

      {/* Files Grid View */}
      <div className="flex-1 overflow-y-auto p-6">
        {filteredFiles.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-center text-neutral-400">
            <HardDrive className="w-10 h-10 mb-2 opacity-40" />
            <p className="text-sm font-medium">No files match your selection</p>
            <p className="text-xs text-neutral-500 mt-1">Upload a file or choose another category</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredFiles.map(file => (
              <div
                key={file.id}
                className="group p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 transition-all flex flex-col justify-between shadow-xs relative"
              >
                {/* Top Row: Icon + Star */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="p-3 rounded-xl bg-neutral-100 dark:bg-neutral-850 text-neutral-700 dark:text-neutral-300">
                    {file.type === 'image' ? (
                      <ImageIcon className="w-5 h-5 text-blue-500" />
                    ) : file.type === 'audio' ? (
                      <Music className="w-5 h-5 text-purple-500" />
                    ) : file.type === 'vault' ? (
                      <Lock className="w-5 h-5 text-emerald-500" />
                    ) : (
                      <FileText className="w-5 h-5 text-amber-500" />
                    )}
                  </div>

                  <button
                    onClick={() => onToggleStar(file.id)}
                    className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                      file.starred
                        ? 'text-amber-400 fill-amber-400'
                        : 'text-neutral-300 dark:text-neutral-600 hover:text-neutral-400'
                    }`}
                  >
                    <Star className={`w-4 h-4 ${file.starred ? 'fill-current' : ''}`} />
                  </button>
                </div>

                {/* File Name & Details */}
                <div className="mb-4">
                  <h4 className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 truncate mb-1" title={file.name}>
                    {file.name}
                  </h4>
                  <div className="flex items-center gap-2 text-[11px] text-neutral-500 dark:text-neutral-400 font-mono tabular-nums">
                    <span>{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                    <span>·</span>
                    <span>{file.extension}</span>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="pt-3 border-t border-neutral-100 dark:border-neutral-850 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setPreviewFile(file)}
                      className="p-1.5 rounded-lg text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                      title="Preview file"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setShareFileTarget(file)}
                      className="p-1.5 rounded-lg text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                      title="Share directly into conversation"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                    <a
                      href={file.url}
                      download={file.name}
                      className="p-1.5 rounded-lg text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                      title="Download file"
                    >
                      <Download className="w-4 h-4" />
                    </a>
                  </div>

                  <button
                    onClick={() => onDeleteFile(file.id)}
                    className="p-1.5 rounded-lg text-neutral-400 hover:text-red-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                    title="Delete from drive"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Share Target Modal */}
      {shareFileTarget && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl w-full max-w-sm p-5 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                Share to Encrypted Chat
              </h3>
              <button
                onClick={() => setShareFileTarget(null)}
                className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-neutral-500 mb-3 truncate">
              Sharing: <span className="font-semibold text-neutral-800 dark:text-neutral-200">{shareFileTarget.name}</span>
            </p>

            <div className="space-y-1.5 max-h-60 overflow-y-auto mb-4">
              {contacts.map(c => (
                <button
                  key={c.id}
                  onClick={() => {
                    onShareToChat(shareFileTarget, c.id);
                    setShareFileTarget(null);
                  }}
                  className="w-full p-2.5 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center gap-3 text-left transition-colors cursor-pointer"
                >
                  <img
                    src={c.avatar}
                    alt={c.name}
                    className="w-8 h-8 rounded-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 truncate">
                      {c.name}
                    </div>
                    <div className="text-[10px] text-neutral-400 truncate">
                      {c.role || c.username}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* File Preview Modal */}
      {previewFile && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 truncate">
                  {previewFile.name}
                </h3>
                <p className="text-[11px] text-neutral-400 font-mono">
                  {(previewFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
              <button
                onClick={() => setPreviewFile(null)}
                className="p-1 rounded-lg text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 flex items-center justify-center bg-neutral-100 dark:bg-neutral-950">
              {previewFile.type === 'image' && previewFile.url !== '#' ? (
                <img
                  src={previewFile.url}
                  alt={previewFile.name}
                  className="max-h-[60vh] object-contain rounded-lg"
                />
              ) : previewFile.type === 'vault' ? (
                <div className="w-full font-mono text-xs p-6 rounded-xl bg-neutral-900 text-neutral-200 border border-neutral-800 text-center">
                  <Lock className="w-8 h-8 mx-auto mb-2 text-emerald-400" />
                  <div className="font-semibold text-sm text-white mb-1">Encrypted File Container</div>
                  <div className="text-neutral-400 text-xs">This file is securely stored in your personal cloud.</div>
                </div>
              ) : (
                <div className="text-center p-8">
                  <FileText className="w-16 h-16 mx-auto mb-3 text-neutral-400" />
                  <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">
                    Preview available on download
                  </p>
                  <p className="text-xs text-neutral-500 mt-1">
                    Document formatted as {previewFile.extension}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
