import React from "react";
import { PaperClipIcon } from "@heroicons/react/24/outline";
import { formatBytes, isPDF, isPreviewable } from "@/helpers";

const AttachmentPreview = ({ file }) => {
    return (
        <div className="w-full flex items-center gap-3 py-2 px-3 rounded-lg bg-surface-elevated border border-border">
            <div className="flex items-center justify-center w-10 h-10 bg-surface rounded-md border border-border shrink-0">
                {isPDF(file.file) && (
                    <img src="/img/pdf.png" alt="PDF icon" className="w-7 h-7 object-contain" />
                )}
                {!isPreviewable(file.file) && (
                    <div className="flex justify-center items-center w-10 h-10 text-muted">
                        <PaperClipIcon className="w-5 h-5" />
                    </div>
                )}
            </div>
            <div className="flex-1 min-w-0 overflow-hidden">
                <h3 className="text-sm font-medium text-main truncate">{file.file.name}</h3>
                <p className="text-xs text-muted">{formatBytes(file.file.size)}</p>
            </div>
        </div>
    );
};

export default AttachmentPreview;
