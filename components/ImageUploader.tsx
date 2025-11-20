
import React, { useState, useRef } from 'react';
import { supabase } from '../services/supabaseClient';
import { IconLoader, IconPlus } from './Icons';

interface ImageUploaderProps {
    onImageSelect: (url: string) => void;
    onUploadStart?: () => void;
    onUploadEnd?: () => void;
    label?: string;
    accept?: string;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ 
    onImageSelect, 
    onUploadStart,
    onUploadEnd,
    label = "Upload Image", 
    accept = "image/*" 
}) => {
    const [uploading, setUploading] = useState(false);
    const [preview, setPreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        
        onUploadStart?.();
        setUploading(true);
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${Date.now()}.${fileExt}`;
            const { error: uploadError } = await supabase.storage.from('images').upload(fileName, file);
            if (uploadError) throw uploadError;
            
            const { data } = supabase.storage.from('images').getPublicUrl(fileName);
            setPreview(data.publicUrl);
            onImageSelect(data.publicUrl);

        } catch (error) {
            console.error(error);
            alert('Error uploading file.');
        } finally {
            setUploading(false);
            onUploadEnd?.();
        }
    };
    
    return (
        <div>
            <input type="file" accept={accept} onChange={handleFileChange} className="hidden" ref={fileInputRef} />
            <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading} className="w-full text-sm border-2 border-dashed border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4 hover:border-primary-500 hover:text-primary-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                {uploading ? <IconLoader className="w-5 h-5 animate-spin" /> : <><IconPlus className="w-5 h-5"/> {label}</>}
            </button>
            {preview && accept.startsWith('image') && <img src={preview} alt="Preview" className="mt-3 rounded-lg max-h-40 object-cover w-full border border-slate-200 dark:border-slate-700" />}
        </div>
    );
};

export default ImageUploader;
