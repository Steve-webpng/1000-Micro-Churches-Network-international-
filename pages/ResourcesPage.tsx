
import React, { memo } from 'react';
import { Resource } from '../types';
import { IconFile, IconDownload } from '../components/Icons';

interface ResourcesPageProps {
    resources: Resource[];
}

const ResourcesPage: React.FC<ResourcesPageProps> = ({ resources }) => {
    const categories = Array.from(new Set(resources.map(r => r.category)));

    return (
        <div className="container mx-auto p-6 max-w-4xl animate-fade-in">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Resources Library</h2>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Download study guides, policy documents, and more.</p>
                </div>
            </div>

            {resources.length > 0 ? (
                <div className="space-y-8">
                    {categories.map(category => (
                        <div key={category}>
                            <h3 className="text-xl font-bold text-slate-700 dark:text-slate-200 mb-4 border-b border-slate-200 dark:border-slate-700 pb-2">{category}</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {resources.filter(r => r.category === category).map(resource => (
                                    <div key={resource.id} className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-md transition flex items-start gap-4 group">
                                        <div className="bg-primary-100 dark:bg-primary-900/30 p-3 rounded-lg text-primary-600 dark:text-primary-400">
                                            <IconFile className="w-6 h-6" />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-bold text-slate-800 dark:text-slate-100 group-hover:text-primary-600 dark:group-hover:text-primary-500 transition-colors">{resource.title}</h4>
                                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 mb-3">{resource.description}</p>
                                            <a href={resource.fileUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm font-bold text-primary-600 dark:text-primary-400 hover:underline">
                                                <IconDownload className="w-4 h-4" /> Download
                                            </a>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-dashed border-slate-300 dark:border-slate-700">
                    <IconFile className="w-12 h-12 text-slate-300 dark:text-slate-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200">No Resources Available</h3>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Check back later for new materials.</p>
                </div>
            )}
        </div>
    );
};

export default memo(ResourcesPage);
