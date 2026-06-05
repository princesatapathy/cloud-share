import { ArrowUpFromLine, X, FileIcon, Loader2 } from 'lucide-react';
import { useRef } from 'react';

const DashboardUpload = ({ files, onFileChange, onUpload, uploading, onRemoveFile, remainingUploads }) => {
    const fileInputRef = useRef(null);

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();

        const droppedFiles = Array.from(e.dataTransfer.files);
        if (droppedFiles.length > 0) {
            const mockEvent = {
                target: {
                    files: droppedFiles
                }
            };
            onFileChange(mockEvent);
        }
    };

    const handleBrowseClick = () => {
        fileInputRef.current.click();
    };

    const formatFileSize = (bytes) => {
        if (bytes < 1024) return bytes + ' B';
        else if (bytes < 1048576) return (bytes / 1024).toFixed(2) + ' KB';
        else return (bytes / 1048576).toFixed(2) + ' MB';
    };

    return (
        <div className="w-full">
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                    <ArrowUpFromLine className="text-terracotta" size={18} />
                    <h2 className="text-base font-medium text-espresso">Upload Files</h2>
                </div>
                <div className="text-xs text-muted">
                    {remainingUploads} of 5 files remaining
                </div>
            </div>

            <div
                className="border-dashed border-2 border-warmborder rounded-xl p-6 text-center bg-surface cursor-pointer hover:border-terracotta transition-colors"
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={handleBrowseClick}
            >
                <div className="flex flex-col items-center justify-center">
                    <div className="p-2 rounded-full bg-terracotta-soft mb-3">
                        <ArrowUpFromLine size={20} className="text-terracotta" />
                    </div>
                    <p className="text-ink text-sm mb-1">Drag and drop files here</p>
                    <p className="text-muted text-xs">or click to browse</p>
                    <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        onChange={onFileChange}
                        className="hidden"
                        accept="*/*"
                        max={5}
                    />
                </div>
            </div>

            {files.length > 0 && (
                <div className="mt-4">
                    <h3 className="text-xs font-medium mb-2 text-espresso">Selected Files ({files.length})</h3>
                    <div className="bg-surface rounded-xl border border-warmborder overflow-hidden">
                        {files.map((file, index) => (
                            <div key={index} className="flex items-center justify-between p-2 border-b border-warmborder last:border-b-0 hover:bg-cream">
                                <div className="flex items-center gap-2">
                                    <FileIcon size={16} className="text-terracotta" />
                                    <div>
                                        <p className="text-xs font-medium text-ink truncate max-w-[150px]">{file.name}</p>
                                        <p className="text-xs text-muted">{formatFileSize(file.size)}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onRemoveFile(index);
                                    }}
                                    className="text-muted hover:text-red-500 transition-colors"
                                    disabled={uploading}
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {files.length > 0 && (
                <div className="mt-3">
                    <button
                        onClick={onUpload}
                        disabled={uploading || files.length === 0}
                        className="w-full py-2 bg-terracotta text-white text-sm rounded-lg hover:bg-terracotta-dark disabled:opacity-50 flex items-center justify-center gap-2 transition-colors"
                    >
                        {uploading ? (
                            <>
                                <Loader2 size={16} className="animate-spin" />
                                <span>Uploading...</span>
                            </>
                        ) : (
                            <span>Upload {files.length} File(s)</span>
                        )}
                    </button>
                </div>
            )}
        </div>
    );
};

export default DashboardUpload;